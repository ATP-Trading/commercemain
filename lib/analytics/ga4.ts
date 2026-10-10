import { measurementMode } from './measurement-mode';
// Public measurement ID of the existing Shopify-connected GA4 stream.
export const GA4_ID = 'G-N47GG1EVK5';
export const CONSENT_KEY = 'atp-analytics-consent';
// Separate, versioned choice: a previous Meta-only grant is not Google Ads consent.
export const GOOGLE_ADS_CONSENT_KEY = 'atp-google-ads-consent-v1';
export const CONSENT_EVENT = 'atp-analytics-consent-changed';
export const SETTINGS_EVENT = 'atp-analytics-settings';

let initialized = false;
let storageBlocked = false;
let lastPage = '';
let lastPageKey = '';
let entryUrl = '';
let entryReferrer = '';
let capturedEntry = false;
const viewedProducts = new Set<string>();
const privatePath = /\/(account|auth|checkout|checkouts|login|signup|search)(?:\/.*)?$/i;
const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_id', 'utm_content', 'utm_term', 'utm_source_platform', 'utm_creative_format', 'utm_marketing_tactic'];
const advertisingKeys = ['gclid', 'dclid', 'gbraid', 'wbraid', 'gad_source', 'gad_campaignid'];

export function analyticsAllowed() {
  if (typeof window === 'undefined' || storageBlocked || measurementMode() === 'off') return false;
  try {
    return window.location.hostname === 'www.atpgroupservices.ae' &&
      localStorage.getItem(CONSENT_KEY) === 'granted';
  } catch { return false; }
}

export function googleAdsAllowed() {
  if (!analyticsAllowed()) return false;
  try { return localStorage.getItem(GOOGLE_ADS_CONSENT_KEY) === 'granted'; }
  catch { return false; }
}

export function safePageUrl(value: string, options: { campaign?: boolean; advertising?: boolean } = {}) {
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol)) return '';
    const sensitive = privatePath.test(url.pathname);
    const path = url.pathname.replace(privatePath, '/$1');
    const clean = new URL(`${url.origin}${path}`);
    // No account IDs, search input, payment tokens, fragments, or arbitrary query keys.
    // Referrers use the default (no query); attribution is allowed only on our public pages.
    if (!sensitive && url.hostname === 'www.atpgroupservices.ae') {
      if (options.campaign) {
        for (const key of campaignKeys) {
          const entry = url.searchParams.get(key)?.trim();
          if (entry && entry.length <= 200 && !/[\u0000-\u001f\u007f@]|%(?:25)*40/i.test(entry)) {
            clean.searchParams.set(key, entry);
          }
        }
      }
      if (options.advertising) {
        for (const key of advertisingKeys) {
          const entry = url.searchParams.get(key);
          if (entry && /^[A-Za-z0-9_.~-]{1,512}$/.test(entry)) clean.searchParams.set(key, entry);
        }
      }
    }
    return clean.toString();
  } catch { return ''; }
}

// Keep only a sanitized entry URL in this document's memory. No cookie, storage,
// request, or pre-consent page history is created. Explicit refusal discards it.
export function captureMeasurementEntry() {
  if (typeof window === 'undefined' || capturedEntry) return;
  try {
    if (localStorage.getItem(CONSENT_KEY) === 'denied') return;
    capturedEntry = true;
    entryUrl = safePageUrl(window.location.href, { campaign: true, advertising: true });
    entryReferrer = safePageUrl(document.referrer);
  } catch { /* Storage denial must not enable measurement. */ }
}
export function measurementPageUrl() {
  captureMeasurementEntry();
  const current = safePageUrl(window.location.href, { campaign: true, advertising: googleAdsAllowed() });
  if (!current || !entryUrl || privatePath.test(new URL(current).pathname)) return current;
  const url = new URL(current);
  const incoming = new URL(safePageUrl(window.location.href, { campaign: true, advertising: true }));
  if ([...campaignKeys, ...advertisingKeys].some(key => incoming.searchParams.has(key))) entryUrl = incoming.toString();
  // Preserve the entry campaign across consent delay / SPA navigation, but let a
  // newly tagged URL take precedence. Never put arbitrary query values in events.
  if (![...campaignKeys, ...advertisingKeys].some(key => url.searchParams.has(key))) {
    const entry = new URL(safePageUrl(entryUrl, { campaign: true, advertising: googleAdsAllowed() }));
    entry.searchParams.forEach((value, key) => url.searchParams.set(key, value));
  }
  return url.toString();
}
const pageUrl = measurementPageUrl;

function pageTitle() {
  return privatePath.test(window.location.pathname) ? 'ATP Trading' : document.title;
}

function command(...args: unknown[]) {
  const w = window as Window & { dataLayer?: unknown[] };
  w.dataLayer ||= [];
  // gtag.js expects the Arguments object, not an array.
  w.dataLayer.push(arguments);
  if (measurementMode() === 'debug' && args[0] === 'event') {
    console.info('[ATP measurement] queued', args[1]);
  }
}

function consentState() {
  const ads = googleAdsAllowed() ? 'granted' : 'denied';
  return { analytics_storage: analyticsAllowed() ? 'granted' : 'denied',
    ad_storage: ads, ad_user_data: ads, ad_personalization: ads };
}

export function initializeGA4() {
  if (!analyticsAllowed() || initialized) return;
  initialized = true;
  // Basic consent mode: no Google script or commands before analytics consent.
  command('consent', 'default', {
    analytics_storage: 'denied', ad_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied',
  });
  command('set', 'ads_data_redaction', true);
  command('consent', 'update', consentState());
  command('js', new Date());
  command('config', GA4_ID, {
    send_page_view: false,
    ...(measurementMode() === 'debug' ? { debug_mode: true, traffic_type: 'internal' } : {}),
    allow_google_signals: false,
    allow_ad_personalization_signals: googleAdsAllowed(),
    cookie_domain: 'atpgroupservices.ae',
    page_location: pageUrl(),
    page_referrer: entryReferrer || safePageUrl(document.referrer),
    page_title: pageTitle(),
  });
  if (!document.getElementById('atp-ga4')) {
    const script = document.createElement('script');
    script.id = 'atp-ga4';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(script);
  }
}

export function trackPage() {
  captureMeasurementEntry();
  if (!analyticsAllowed()) return;
  initializeGA4();
  const page = pageUrl();
  const key = safePageUrl(window.location.href, { campaign: true });
  if (key === lastPageKey) return;
  const referrer = safePageUrl(lastPage || entryReferrer || document.referrer);
  lastPage = page; lastPageKey = key;
  viewedProducts.clear();
  command('set', { page_location: page, page_referrer: referrer });
  command('event', 'page_view', {
    send_to: GA4_ID, page_location: page, page_referrer: referrer,
    page_title: pageTitle(),
  });
}

export type AnalyticsItem = { item_id: string; item_name: string; price: number; quantity: number };
export function trackProduct(event: 'view_item' | 'add_to_cart' | 'remove_from_cart', item: AnalyticsItem, currency: string) {
  if (!analyticsAllowed()) return;
  initializeGA4();
  if (event === 'view_item') {
    if (viewedProducts.has(item.item_id)) return;
    viewedProducts.add(item.item_id);
  }
  command('event', event, { send_to: GA4_ID, currency,
    value: item.price * item.quantity, items: [item], page_location: pageUrl(),
  });
}

export function trackCart(event: 'view_cart', items: AnalyticsItem[], currency: string, value: number) {
  if (!analyticsAllowed() || !items.length || !Number.isFinite(value)) return;
  initializeGA4();
  command('event', event, { send_to: GA4_ID, currency, value, items, page_location: pageUrl() });
}

// Shopify's checkout owns begin_checkout/payment/purchase. Record the handoff
// separately so a click is not mistaken for a loaded checkout or counted twice.
export function trackCheckoutClick(items: AnalyticsItem[], currency: string, value: number): Promise<void> {
  if (!analyticsAllowed() || !items.length) return Promise.resolve();
  initializeGA4();
  return new Promise(resolve => {
    const timer = setTimeout(resolve, 500);
    command('event', 'checkout_click', { send_to: GA4_ID, currency, value, items,
      page_location: pageUrl(), transport_type: 'beacon', event_timeout: 450,
      event_callback: () => { clearTimeout(timer); resolve(); },
    });
  });
}

function clearCookies(advertising: boolean) {
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.trim().split('=')[0] || '';
    if (advertising ? name.startsWith('_gcl_') : name === '_ga' || name.startsWith('_ga_')) {
      for (const domain of ['', '; domain=atpgroupservices.ae', '; domain=www.atpgroupservices.ae']) {
        document.cookie = `${name}=; Max-Age=0; path=/${domain}`;
      }
    }
  }
}

export function setAnalyticsConsent(granted: boolean, advertising: boolean = false) {
  if (typeof window === 'undefined') return;
  captureMeasurementEntry();
  const previouslyAllowed = analyticsAllowed();
  try {
    // Store both choices before notifying any page/product listeners.
    localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied');
    localStorage.setItem(GOOGLE_ADS_CONSENT_KEY, granted && advertising ? 'granted' : 'denied');
    storageBlocked = false;
  } catch {
    // A partial/failed preference write must never leave tracking enabled.
    storageBlocked = true;
    (window as unknown as Record<string, unknown>)[`ga-disable-${GA4_ID}`] = true;
    if (initialized) command('consent', 'update', consentState());
    return;
  }
  (window as unknown as Record<string, unknown>)[`ga-disable-${GA4_ID}`] = !analyticsAllowed();
  if (initialized) {
    // Remove stale click IDs before a consent update can trigger a tag request.
    command('config', GA4_ID, { update: true, send_page_view: false,
      page_location: pageUrl(), page_referrer: safePageUrl(document.referrer),
      page_title: pageTitle(), allow_ad_personalization_signals: googleAdsAllowed() });
    command('consent', 'update', consentState());
  }
  if (!analyticsAllowed()) { clearCookies(false); entryUrl = ''; entryReferrer = ''; capturedEntry = false; }
  if (!googleAdsAllowed()) clearCookies(true);
  if (!previouslyAllowed || !analyticsAllowed()) {
    lastPage = ''; lastPageKey = '';
    viewedProducts.clear();
  } else if (lastPage) {
    // Changing only ad consent is not a new page/product view.
    lastPage = pageUrl();
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}
