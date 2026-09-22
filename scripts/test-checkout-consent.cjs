/* Offline regression checks against source. No browser, network, orders or events.
 * Run: node scripts/test-checkout-consent.cjs (requires project's typescript).
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const ROOT = path.resolve(__dirname, '..');
const tests = [];
const test = (name, fn) => tests.push({ name, fn });
const plain = value => JSON.parse(JSON.stringify(value));
const KEY = 'atp-checkout-consent-v1';

function harness({ browser = true, cookie, storage, host = 'www.atpgroupservices.ae', loggedIn = false } = {}) {
  const values = new Map(Object.entries(storage || {}));
  const cookieJar = new Map(cookie ? [[KEY, cookie]] : []);
  const writes = [], sent = [], dispatch = [], requests = [];
  let readFails = false, writeFails = false, cookieFails = false;
  let response = { data: { cart: { checkoutUrl: 'https://example.myshopify.com/cart/c/fake?key=fake&_cs=provider-opaque' } } };
  let providerError = null;
  const localStorage = {
    getItem(k) { if (readFails) throw Error('Storage unavailable'); return values.get(k) ?? null; },
    setItem(k, v) { if (writeFails) throw Error('Storage unavailable'); values.set(k, String(v)); }
  };
  const doc = {
    title: 'Test product', referrer: '',
    head: { appendChild(x) { sent.push(x); } },
    getElementById(id) { return sent.find(x => x.id === id) || null; },
    createElement() { return {}; },
    get cookie() { return [...cookieJar].map(([k,v]) => `${k}=${v}`).join('; '); },
    set cookie(v) {
      if (cookieFails) throw Error('Cookies unavailable');
      writes.push(v);
      const [pair] = v.split(';'); const [k,val] = pair.split('=');
      if (/Max-Age=0/i.test(v)) cookieJar.delete(k); else cookieJar.set(k,val);
    }
  };
  const initialCart = { id: 'initial-cart', checkoutUrl: 'https://example.myshopify.com/cart/c/fake?key=fake' };
  const finalCart = { ...initialCart, id: loggedIn ? 'buyer-cart' : 'guest-session-cart' };
  const mocks = {
    'server-only': {},
    '@/lib/shopify/server': {
      shopifyFetch: async args => { requests.push(plain(args)); if(providerError) throw providerError; return {status:200, body:response}; },
      getCart: async () => initialCart,
      updateCartBuyerIdentity: async () => ({ cart: finalCart, userErrors: [] }),
      addToCart: () => { throw Error('Mutations forbidden in test'); },
      removeFromCart: () => { throw Error('Mutations forbidden in test'); },
    },
    'next/headers': { cookies: async () => ({ get: k => cookieJar.has(k) ? {value:cookieJar.get(k)} : undefined }) },
    'next-intl/server': { getLocale: async () => 'ar' },
    '@/lib/cart/session-cart': { cartForSession: async () => loggedIn ? initialCart : finalCart },
    '@/lib/shopify/customer-account-oauth': { getValidAccessToken: async () => loggedIn ? 'mock-only' : null },
    '@/lib/constants': {TAGS:{cart:'cart'}},
    'next/cache': {updateTag(){}},
    'next/navigation': {redirect(url) { throw Object.assign(new Error('NEXT_REDIRECT'), {url}); }},
  };
  const context = vm.createContext({ URL, Date, Set, Map, console,
    Event: class { constructor(type) { this.type=type; } },
    process: {env: {SHOPIFY_CHECKOUT_DOMAIN:'checkout.atpgroupservices.ae'}},
    ...(browser ? {localStorage, document:doc, window:{location:new URL(`https://${host}/en?utm_source=google&gclid=Mock123`),localStorage,
      dispatchEvent(e) { dispatch.push({type:e.type,cookie:cookieJar.get(KEY)}); }}} : {})
  });
  const cache = new Map();
  function load(rel) {
    const file = path.resolve(ROOT, rel);
    assert(file.startsWith(ROOT + path.sep), 'Source must be inside project');
    if(cache.has(file)) return cache.get(file).exports;
    const result = ts.transpileModule(fs.readFileSync(file,'utf8'), {
      fileName:file, reportDiagnostics:true,
      compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}
    });
    assert.equal((result.diagnostics || []).filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
    const mod = {exports:{}}; cache.set(file,mod);
    const req = id => {
      if(Object.hasOwn(mocks,id)) return mocks[id];
      const target = id.startsWith('@/') ? path.join(ROOT,id.slice(2)) : id.startsWith('.') ? path.resolve(path.dirname(file),id) : null;
      if(!target) throw Error(`External dependency forbidden: ${id}`);
      return load(path.relative(ROOT, target.endsWith('.ts') ? target : target+'.ts'));
    };
    const wrapper = vm.runInContext(`(function(require,module,exports){${result.outputText}\n})`,context,{filename:file});
    wrapper(req,mod,mod.exports); return mod.exports;
  }
  return {load,values,cookieJar,writes,sent,dispatch,requests,context,finalCart,
    failReads(){readFails=true;},failWrites(){writeFails=true;},failCookies(){cookieFails=true;},
    respond(v){response=v;},reject(e){providerError=e;}
  };
}
const stored = (a,g) => ({'atp-analytics-consent':a, 'atp-google-ads-consent-v1':g});
const consent = h => h.load('lib/analytics/checkout-consent.ts');
const ga = h => h.load('lib/analytics/ga4.ts');
const server = h => h.load('lib/cart/checkout-consent-server.ts');
const events = h => (h.context.window.dataLayer||[]).map(x=>Array.from(x)).filter(x=>x[0]==='event');

for (const [value,a,m] of [['v1.0.0',false,false],['v1.1.0',true,false],['v1.1.1',true,true]]) {
  test(`decodes ${value} without adding optional permissions`,()=>{
    const h=harness(); assert.deepEqual(plain(consent(h).decodeCheckoutConsent(value)),{analytics:a,marketing:m,preferences:false,saleOfData:false});
  });
}
for(const value of [undefined,'','v1.0.1','v2.1.1','v1.1.1; x=y','granted']) {
  test(`rejects invalid or absent cookie ${String(value)}`,()=>assert.equal(consent(harness()).decodeCheckoutConsent(value),null));
}
for(const [a,m,out] of [['denied','denied','v1.0.0'],['granted','denied','v1.1.0'],['granted','granted','v1.1.1'],['denied','granted','v1.0.0']]) {
  test(`maps stored choices ${a}/${m}`,()=>{
    const h=harness({storage:stored(a,m)});consent(h).syncCheckoutConsentCookie(); assert.equal(h.cookieJar.get(KEY),out);
  });
}
test('no existing choice does not create a consent grant',()=>{
  const h=harness(); ga(h).trackPage(); assert.equal(h.cookieJar.has(KEY),false); assert.equal(h.sent.length,0); assert.equal(events(h).length,0);
});
test('legacy Meta-only grant does not create checkout advertising permission',()=>{
  const h=harness({storage:{'atp-analytics-consent':'granted','atp-marketing-consent':'granted'}});
  consent(h).syncCheckoutConsentCookie(); assert.equal(h.cookieJar.has(KEY),false);
});
test('decline is synchronized before consent listeners and queues no Google event',()=>{
  const h=harness();ga(h).setAnalyticsConsent(false); assert.equal(h.dispatch[0].cookie,'v1.0.0'); assert.equal(h.sent.length,0); assert.equal(events(h).length,0);
});
test('allow all synchronizes the current banner choice',()=>{
  const h=harness(); ga(h).setAnalyticsConsent(true,true); assert.equal(h.cookieJar.get(KEY),'v1.1.1');
});
test('ad-only withdrawal preserves analytics but updates checkout immediately',()=>{
  const h=harness();const g=ga(h);g.setAnalyticsConsent(true,true);g.trackPage();g.setAnalyticsConsent(true,false);g.trackPage();
  assert.equal(h.cookieJar.get(KEY),'v1.1.0'); assert.equal(events(h).filter(x=>x[1]==='page_view').length,1);
});
test('all withdrawal is kept when navigation occurs while analytics is denied',()=>{
  const h=harness();const g=ga(h);g.setAnalyticsConsent(true,true);g.trackPage();g.setAnalyticsConsent(false);g.trackPage();
  assert.equal(h.cookieJar.get(KEY),'v1.0.0'); assert.equal(events(h).length,1);
});
test('saved refusal restores the session cookie without analytics traffic',()=>{
  const h=harness({storage:stored('denied','denied')});ga(h).trackPage(); assert.equal(h.cookieJar.get(KEY),'v1.0.0');assert.equal(h.sent.length,0);
});
test('cookie is host-only, secure, same-site and session-scoped',()=>{
  const h=harness({storage:stored('granted','denied')});consent(h).syncCheckoutConsentCookie();
  assert.equal(h.writes.at(-1),`${KEY}=v1.1.0; Path=/; SameSite=Lax; Secure`);
});
test('storage read failures remove a stale grant',()=>{
  const h=harness({cookie:'v1.1.1'});h.failReads();consent(h).syncCheckoutConsentCookie(); assert.equal(h.cookieJar.has(KEY),false);
});
test('storage write failures disable Google and remove stale checkout consent',()=>{
  const h=harness({cookie:'v1.1.1',storage:stored('granted','granted')});h.failWrites();ga(h).setAnalyticsConsent(false);ga(h).trackPage();
  assert.equal(h.cookieJar.has(KEY),false);assert.equal(h.context.window['ga-disable-G-N47GG1EVK5'],true);assert.equal(events(h).length,0);
});
test('cookie write errors do not break the banner interaction',()=>{
  const h=harness();h.failCookies(); assert.doesNotThrow(()=>ga(h).setAnalyticsConsent(false));
});
test('preview visits neither write checkout cookies nor send Google events',()=>{
  const h=harness({host:'preview.vercel.app',storage:stored('granted','granted')});ga(h).trackPage();assert.equal(h.writes.length,0);assert.equal(h.sent.length,0);
});
test('server-side module evaluation requires no browser storage',()=>{
  const h=harness({browser:false});assert.doesNotThrow(()=>consent(h).syncCheckoutConsentCookie());
});
test('no consent cookie leaves native checkout and avoids an extra request',async()=>{
  const h=harness({browser:false});assert.equal(await server(h).getConsentedCheckoutUrl('mock','https://example.test',undefined),'https://example.test');assert.equal(h.requests.length,0);
});
test('valid refusal is sent in the documented Storefront query, not a mutation',async()=>{
  const h=harness({browser:false}); const url=await server(h).getConsentedCheckoutUrl('session-cart','https://example.test','v1.0.0');
  assert.equal(new URL(url).searchParams.get('_cs'),'provider-opaque');
  assert.deepEqual(h.requests[0].variables,{cartId:'session-cart',visitorConsent:{analytics:false,marketing:false,preferences:false,saleOfData:false}});
  assert.match(h.requests[0].query,/@inContext\(visitorConsent: \$visitorConsent\)/);assert.doesNotMatch(h.requests[0].query,/\bmutation\b/);
});
test('missing session cart ID does not make a provider request',async()=>{
  const h=harness({browser:false});await assert.rejects(server(h).getConsentedCheckoutUrl(undefined,'https://example.test','v1.0.0'));assert.equal(h.requests.length,0);
});
for(const returned of [null,'https://example.test/cart/c/fake','javascript:alert(1)','https://example.test/?_cs=']) {
  test(`rejects missing or unusable provider consent URL ${String(returned)}`,async()=>{
    const h=harness({browser:false});h.respond({data:{cart:returned===null?null:{checkoutUrl:returned}}});
    await assert.rejects(server(h).getConsentedCheckoutUrl('mock','https://example.test','v1.0.0'),/Unable to prepare checkout preferences/);
  });
}
test('provider outage is surfaced rather than silently ignoring an explicit refusal',async()=>{
  const h=harness({browser:false});h.reject(Error('Mock outage'));await assert.rejects(server(h).getConsentedCheckoutUrl('mock','https://example.test','v1.0.0'),/Mock outage/);
});
for(const loggedIn of [false,true]) {
  test(`common checkout action applies consent after ${loggedIn?'buyer':'guest-session'} reconciliation and preserves localization`,async()=>{
    const h=harness({browser:false,cookie:'v1.1.0',loggedIn});const a=h.load('components/cart/actions.ts');
    const url=new URL(await a.getCheckoutUrl());
    assert.equal(h.requests[0].variables.cartId,h.finalCart.id);assert.equal(url.hostname,'checkout.atpgroupservices.ae');
    assert.equal(url.searchParams.get('_cs'),'provider-opaque');assert.equal(url.searchParams.get('key'),'fake');assert.equal(url.searchParams.get('locale'),'ar');
  });
}
test('the existing form redirect uses the consent-aware common action',async()=>{
  const h=harness({browser:false,cookie:'v1.0.0'});const a=h.load('components/cart/actions.ts');
  await assert.rejects(a.redirectToCheckout(), e=>e.message==='NEXT_REDIRECT' && new URL(e.url).searchParams.has('_cs'));
});
test('existing GA4 campaign filtering and product/page deduplication remain intact',()=>{
  const h=harness();const g=ga(h);g.setAnalyticsConsent(true,true);g.trackPage();g.trackPage();
  const item={item_id:'mock',item_name:'Test',price:220,quantity:1};g.trackProduct('view_item',item,'AED');g.trackProduct('view_item',item,'AED');
  assert.equal(events(h).filter(x=>x[1]==='page_view').length,1);assert.equal(events(h).filter(x=>x[1]==='view_item').length,1);
  assert.match(events(h)[0][2].page_location,/utm_source=google&gclid=Mock123/);assert.equal(events(h).some(x=>x[1]==='purchase'),false);
  assert.equal(g.safePageUrl('https://www.atpgroupservices.ae/checkouts/secret?token=secret&utm_source=x',{campaign:true,advertising:true}),'https://www.atpgroupservices.ae/checkouts');
});
(async()=>{
  let failures=0;
  for(const {name,fn} of tests) {
    try {await fn();console.log('PASS '+name);} catch(e) {failures++;console.error('FAIL '+name+'\n'+e.stack);}
  }
  console.log(JSON.stringify({mode:'OFFLINE_SOURCE_SIMULATION_NO_NETWORK',passed:tests.length-failures,total:tests.length,liveShopifyVerified:false,liveGoogleDeliveryVerified:false}));
  process.exitCode=failures?1:0;
})().catch(e=>{console.error(e);process.exitCode=1;});
