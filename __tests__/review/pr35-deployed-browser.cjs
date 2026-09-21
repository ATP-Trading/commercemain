'use strict';
// Verification branch only. Never persist the access URL, cookies, private key,
// traces, request bodies, or authentication-page screenshots in an artifact.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const SOURCE = '060397c03cdac89614b4ddd9f0569beff83c7aeb';
const HOST = 'commercemain-8cm9dnt1d-atp-trading.vercel.app';
const ORIGIN = `https://${HOST}`;
const OUT = path.resolve('browser-evidence');
const PRIVATE = path.join(process.env.RUNNER_TEMP, 'pr35-preview-private.pem');
const HANDSHAKE = path.resolve('preview-public-handshake.json');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const cleanUrl = value => { try { const u = new URL(value); return `${u.origin}${u.pathname}`; } catch { return 'invalid URL'; } };
let accessSecret = '';
const redact = text => String(text).replaceAll(accessSecret || 'UNUSED_SECRET_SENTINEL', '[REDACTED]').replace(/([?&](?:_vercel_share|nonce|token|code|state|access_token|id_token)=)[^\s&"']+/gi, '$1[REDACTED]').slice(0, 1600);

async function handshake() {
  const pair = crypto.generateKeyPairSync('rsa', { modulusLength: 3072,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });
  fs.writeFileSync(PRIVATE, pair.privateKey, { mode: 0o600 });
  fs.writeFileSync(HANDSHAKE, JSON.stringify({ runId: process.env.GITHUB_RUN_ID,
    source: SOURCE, publicKey: pair.publicKey,
    fingerprint: crypto.createHash('sha256').update(pair.publicKey).digest('hex') }, null, 2));
  console.log('Ephemeral public handshake ready. Private key stays only in runner temporary storage.');
}

async function receiveAccess() {
  const own = JSON.parse(fs.readFileSync(HANDSHAKE, 'utf8'));
  const endpoint = 'https://raw.githubusercontent.com/ATP-Trading/commercemain/test/pr30-isolated-validation/__tests__/review/pr35-preview-envelope.json';
  for (let i = 0; i < 48; i++) {
    try {
      const response = await fetch(`${endpoint}?run=${own.runId}&poll=${Date.now()}`, { signal: AbortSignal.timeout(15000), cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        if (data.runId === own.runId && data.fingerprint === own.fingerprint && data.algorithm === 'RSA-OAEP-256') {
          const url = crypto.privateDecrypt({ key: fs.readFileSync(PRIVATE),
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, Buffer.from(data.ciphertext, 'base64')).toString('utf8');
          const parsed = new URL(url);
          assert.equal(parsed.origin, ORIGIN);
          assert.equal(parsed.pathname, '/en/auth/login');
          assert.ok(parsed.searchParams.get('_vercel_share'));
          accessSecret = parsed.searchParams.get('_vercel_share');
          console.log(`::add-mask::${accessSecret}`);
          console.log(`::add-mask::${url}`);
          fs.rmSync(PRIVATE, { force: true });
          return url;
        }
      }
    } catch { /* Only the intended matching envelope can unlock this run. */ }
    await pause(10000);
  }
  throw new Error('Temporary preview authorization was not delivered to this runner.');
}

async function run() {
  fs.mkdirSync(OUT, { recursive: true });
  const report = { source: SOURCE, deploymentHost: HOST, startedAt: new Date().toISOString(),
    scope: 'Real Chromium against the deployed Preview; guest browsing only. No customer credentials, transaction, account mutation, production promotion or source modification.',
    access: null, checks: [], pageErrors: [], consoleErrors: [], httpFailures: [], blockedWrites: [], screenshots: [] };
  let browser;
  const save = () => {
    report.finishedAt = new Date().toISOString();
    report.passed = report.checks.filter(c => c.status === 'passed').length;
    report.failed = report.checks.filter(c => c.status === 'failed').length;
    report.status = report.access?.status !== 'granted' ? 'blocked' : (report.failed || report.pageErrors.length ? 'failed' : 'passed');
    fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  };
  const check = async (name, task) => {
    try { const details = await task(); report.checks.push({ name, status: 'passed', details }); }
    catch (error) { report.checks.push({ name, status: 'failed', error: redact(error.message) }); }
  };
  try {
    const accessUrl = await receiveAccess();
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
    await context.route('**/*', route => {
      const req = route.request();
      const u = new URL(req.url());
      if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method())) {
        report.blockedWrites.push({ method: req.method(), url: cleanUrl(req.url()) });
        return route.abort();
      }
      if (u.hostname === HOST && /^\/api\/auth\/(login|logout|callback)$/.test(u.pathname)) return route.abort();
      if (req.isNavigationRequest() && ![HOST, 'vercel.com'].includes(u.hostname)) return route.abort();
      return route.continue();
    });
    const page = await context.newPage();
    const authHops = [];
    page.on('response', response => {
      if (response.request().isNavigationRequest()) authHops.push({ status: response.status(), url: cleanUrl(response.url()) });
    });
    let initialStatus = null;
    try {
      initialStatus = (await page.goto(accessUrl, { waitUntil: 'domcontentloaded', timeout: 45000 }))?.status();
      await page.locator('main#main-content').waitFor({ state: 'visible', timeout: 15000 });
    } catch { /* Report auth access separately from application test failures. */ }
    if (new URL(page.url()).hostname !== HOST || !(await page.locator('main#main-content').isVisible().catch(() => false))) {
      report.access = { status: 'blocked', initialStatus, finalUrl: cleanUrl(page.url()), redirects: authHops,
        explanation: 'Browser followed cookies and redirects but did not reach the storefront. No page tests counted as passed.' };
      process.exitCode = 2;
      return;
    }
    report.access = { status: 'granted', initialStatus, finalUrl: cleanUrl(page.url()), redirects: authHops };
    page.on('pageerror', error => report.pageErrors.push({ page: cleanUrl(page.url()), error: redact(error.message) }));
    page.on('console', msg => { if (msg.type() === 'error') report.consoleErrors.push({ page: cleanUrl(page.url()), error: redact(msg.text()) }); });
    page.on('response', response => { if (response.status() >= 400 && new URL(response.url()).hostname === HOST)
      report.httpFailures.push({ page: cleanUrl(page.url()), status: response.status(), resource: cleanUrl(response.url()) }); });
    const catalogs = Object.fromEntries(['en', 'ar'].map(locale => [locale, JSON.parse(fs.readFileSync(`messages/${locale}.json`, 'utf8'))]));
    const paths = ['', '/auth/login', '/signup', '/atp-membership', '/cart', '/collections/amazing-thai-products', '/search?q=collagen'];
    let productPath = null;
    for (const locale of ['en', 'ar']) {
      for (const suffix of paths) {
        const routePath = `/${locale}${suffix}`;
        await check(`Desktop guest page ${routePath}`, async () => {
          const response = await page.goto(`${ORIGIN}${routePath}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
          assert.equal(new URL(page.url()).hostname, HOST, 'Unexpected navigation away from Preview');
          assert.ok(response && response.status() < 400, `Page returned HTTP ${response?.status()}`);
          const main = page.locator('main#main-content');
          await main.waitFor({ state: 'visible', timeout: 15000 });
          await page.waitForTimeout(1200);
          const text = (await main.innerText()).trim();
          assert.ok(text.length > 20, 'Main content did not render');
          assert.ok(!/Application error:|Internal Server Error|This page could not be found/i.test(text), 'Application error page rendered');
          const direction = await main.evaluate(el => getComputedStyle(el).direction);
          assert.equal(direction, locale === 'ar' ? 'rtl' : 'ltr');
          if (suffix.includes('collections') && locale === 'en') {
            const hrefs = await main.locator('a[href]').evaluateAll(links => links.map(link => link.getAttribute('href')));
            productPath = hrefs.find(href => /^\/en\/product\/[a-z0-9-]+\/?$/i.test(href)) || null;
          }
          if (['', '/auth/login', '/cart', '/atp-membership'].includes(suffix)) {
            const file = `desktop-${locale}-${suffix.replace(/\W+/g, '-') || 'home'}.png`;
            await page.screenshot({ path: path.join(OUT, file), fullPage: true }); report.screenshots.push(file);
          }
          return { http: response.status(), finalPath: new URL(page.url()).pathname, direction, mainCharacters: text.length,
            headings: await main.locator('h1,h2').allTextContents() };
        });
      }
    }
    if (productPath) {
      for (const locale of ['en', 'ar']) await check(`Actual product page ${locale}`, async () => {
        const routePath = productPath.replace(/^\/en\//, `/${locale}/`);
        const response = await page.goto(`${ORIGIN}${routePath}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
        assert.equal(response?.status(), 200);
        await page.locator('main#main-content h1').waitFor({ state: 'visible', timeout: 15000 });
        await page.waitForTimeout(1200);
        const file = `desktop-${locale}-product.png`; await page.screenshot({ path: path.join(OUT, file), fullPage: true }); report.screenshots.push(file);
        return { route: routePath, heading: await page.locator('main h1').first().innerText() };
      });
    } else report.checks.push({ name: 'Discover real product from collection', status: 'failed', error: 'No current product link found; product page not tested.' });
    await page.setViewportSize({ width: 390, height: 844 });
    for (const locale of ['en', 'ar']) {
      await check(`Mobile ${locale} menu opens and closes`, async () => {
        await page.goto(`${ORIGIN}/${locale}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
        const open = page.getByRole('button', { name: catalogs[locale].navbar.openMenu, exact: true });
        await open.click({ timeout: 15000 });
        const dialog = page.getByRole('dialog'); await dialog.waitFor({ state: 'visible' });
        assert.ok(await dialog.locator(`a[href="/${locale}/login"]`).isVisible(), 'Guest sign-in link missing');
        const file = `mobile-${locale}-menu.png`; await page.screenshot({ path: path.join(OUT, file), fullPage: true }); report.screenshots.push(file);
        await page.getByRole('button', { name: locale === 'ar' ? 'إغلاق القائمة' : 'Close menu', exact: true }).click();
        await dialog.waitFor({ state: 'hidden' });
        return { viewport: '390x844', guestSignIn: true };
      });
      await check(`Mobile ${locale} no horizontal overflow`, async () => {
        const dimensions = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
        assert.ok(dimensions.document <= dimensions.viewport + 1, JSON.stringify(dimensions));
        const file = `mobile-${locale}-home.png`; await page.screenshot({ path: path.join(OUT, file), fullPage: true }); report.screenshots.push(file);
        return dimensions;
      });
    }
    if (report.checks.some(c => c.status === 'failed') || report.pageErrors.length) process.exitCode = 1;
  } catch (error) {
    report.access ||= { status: 'blocked' };
    report.harnessError = redact(error.message);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    fs.rmSync(PRIVATE, { force: true });
    save();
  }
}
(async () => { if (process.argv[2] === 'handshake') await handshake(); else await run(); })().catch(() => { console.error('Browser harness failed before report creation.'); process.exitCode = 1; });
