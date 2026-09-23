// @vitest-environment node
import {beforeEach, afterEach, describe, expect, it, vi} from 'vitest';
import {handleShopifyVisitRequest, selectShopifyCookies, hostOnlyShopifyCookie} from '../../lib/analytics/shopify-visit-proxy';

const mocked = vi.hoisted(() => ({send: vi.fn(async () => {}), values: vi.fn(() => ({uniqueToken:'provider-user', visitToken:'provider-visit', consent:'opaque'}))}));
vi.mock('@shopify/hydrogen-react/analytics', () => ({sendShopifyAnalytics:mocked.send, getClientBrowserParameters:()=>({url:'unsafe', path:'unsafe', search:'unsafe', referrer:'unsafe', title:'unsafe', userAgent:'test', navigationType:'navigate', navigationApi:'PerformanceNavigationTiming'})}));
vi.mock('@shopify/hydrogen-react/tracking-utils', () => ({getTrackingValues:mocked.values}));
const ORIGIN='https://www.atpgroupservices.ae';
const SHOP='gid://shopify/Shop/72307441902';
const config={origin:ORIGIN, domain:'example.myshopify.com', token:'server-secret'};
const request=(body:unknown={analytics:true}, headers:Record<string,string>={})=>new Request(ORIGIN+'/api/analytics/shopify', {method:'POST',headers:{origin:ORIGIN,'content-type':'application/json','x-atp-analytics-consent':'v1',...headers},body:JSON.stringify(body)});
const provider=()=>new Response(JSON.stringify({data:{consentManagement:{cookies:{cookieDomain:ORIGIN}}}}),{status:200,headers:{'Server-Timing':'_y;desc="user", _s;desc="visit", _cmp;desc="consent"','Set-Cookie':'_shopify_analytics=opaque; HttpOnly; Domain=.example.myshopify.com'}});
const noFetch=vi.fn();
afterEach(()=>vi.unstubAllGlobals());

describe('narrow Shopify tracking gateway',()=>{
 it.each([
  ['foreign origin',{analytics:true},{origin:'https://evil.example'},403],
  ['missing consent header',{analytics:true},{'x-atp-analytics-consent':'false'},403],
  ['refused analytics',{analytics:false},{},400],
  ['arbitrary GraphQL',{analytics:true,query:'mutation { notAllowed }'},{},400],
  ['wrong content type',{analytics:true},{'content-type':'text/plain'},415],
  ['oversized body',{analytics:true},{'content-length':'9999'},413],
 ] as const)('rejects %s',async(_name,body,headers,status)=>{
  noFetch.mockClear(); const response=await handleShopifyVisitRequest(request(body,headers),config,noFetch);
  expect(response.status).toBe(status); expect(noFetch).not.toHaveBeenCalled();
 });
 it('forwards only Shopify-owned cookies, not customer/cart/app cookies',()=>{
  expect(selectShopifyCookies('cartId=secret; _shopify_analytics=opaque; account=secret')).toBe('_shopify_analytics=opaque');
  const value=hostOnlyShopifyCookie('_shopify_analytics=opaque%2Bvalue; Domain=.myshopify.com; HttpOnly; Path=/');
  expect(value).toContain('opaque%2Bvalue');expect(value).toContain('HttpOnly');expect(value).toContain('Secure');expect(value).not.toContain('Domain=');
  expect(hostOnlyShopifyCookie('auth=private')).toBeNull();
 });
 it('returns uncached tracking headers without exposing the token or upstream body',async()=>{
  const fetcher=vi.fn(async()=>provider());
  const response=await handleShopifyVisitRequest(request(),config,fetcher);
  expect(response.status).toBe(200);expect(response.headers.get('cache-control')).toContain('no-store');
  expect(response.headers.getSetCookie()).toHaveLength(1);expect(await response.json()).toEqual({ok:true,shopId:SHOP});
  expect(fetcher.mock.calls[0]?.[0]).toBe('https://example.myshopify.com/api/unstable/graphql.json');
 });
 it('contains outages without touching checkout',async()=>{
  expect((await handleShopifyVisitRequest(request(),config,async()=>{throw Error('offline');})).status).toBe(503);
  expect((await handleShopifyVisitRequest(request(),config,async()=>new Response('{}',{status:500}))).status).toBe(503);
 });
 it('requires modern tracking headers before reporting success',async()=>{
  const p=provider();p.headers.delete('server-timing');
  expect((await handleShopifyVisitRequest(request(),config,async()=>p)).status).toBe(503);
 });
 it('withdraws only host-local analytics cookies without a provider call',async()=>{
  noFetch.mockClear();const r=await handleShopifyVisitRequest(new Request(ORIGIN+'/api/analytics/shopify',{method:'DELETE',headers:{origin:ORIGIN,'x-atp-analytics-consent':'v1'}}),config,noFetch);
  expect(r.status).toBe(204);expect(r.headers.getSetCookie()).toHaveLength(2);expect(noFetch).not.toHaveBeenCalled();
 });
});

describe('consent-aware storefront visits',()=>{
 let data:Map<string,string>;
 let browser:{location:URL};
 let fetcher:ReturnType<typeof vi.fn>;
 beforeEach(()=>{
  vi.resetModules();mocked.send.mockClear();mocked.values.mockReturnValue({uniqueToken:'provider-user',visitToken:'provider-visit',consent:'opaque'});
  data=new Map([['atp-analytics-consent','granted'],['atp-google-ads-consent-v1','granted']]);
  browser={location:new URL(ORIGIN+'/en/product/mores-collagen?utm_source=google&gclid=Test123&email=private')};
  vi.stubGlobal('window',browser);vi.stubGlobal('location',browser.location);
  vi.stubGlobal('localStorage',{getItem:(k:string)=>data.get(k)||null,setItem:(k:string,v:string)=>data.set(k,v)});
  vi.stubGlobal('document',{title:'Collagen',referrer:'https://www.google.com/?q=private'});
  fetcher=vi.fn(async()=>new Response(JSON.stringify({ok:true,shopId:SHOP})));vi.stubGlobal('fetch',fetcher);
 });
 const load=()=>import('../../lib/analytics/shopify-visits');
 const accept=async()=>{const m=await load();m.setShopifyVisitConsent(true);return m;};
 it('does not treat legacy Google consent as Shopify consent',async()=>{await (await load()).trackShopifyPageView();expect(fetcher).not.toHaveBeenCalled();});
 it('records only a public page with sanitized URL and correct shop identity',async()=>{
  await (await accept()).trackShopifyPageView();expect(mocked.send).toHaveBeenCalledTimes(1);
  const event=mocked.send.mock.calls[0]?.[0] as any;
  expect(event.eventName).toBe('PAGE_VIEW');expect(event.payload.shopId).toBe(SHOP);
  expect(event.payload.url).toBe(ORIGIN+'/en/product/mores-collagen?utm_source=google&gclid=Test123');
  expect(JSON.stringify(event)).not.toContain('private');expect(event.payload.marketingAllowed).toBe(false);
 });
 it('deduplicates concurrent effects, rerenders, and advertising-only changes',async()=>{
  const m=await accept();await Promise.all([m.trackShopifyPageView(),m.trackShopifyPageView()]);data.set('atp-google-ads-consent-v1','denied');await m.trackShopifyPageView();
  expect(mocked.send).toHaveBeenCalledTimes(1);expect(fetcher).toHaveBeenCalledTimes(1);
 });
 it.each(['/ar/account/orders/private','/en/search','/en/checkouts/private'])('does not measure private path %s',async path=>{
  browser.location=new URL(ORIGIN+path);vi.stubGlobal('location',browser.location);await (await accept()).trackShopifyPageView();expect(fetcher).not.toHaveBeenCalled();
 });
 it('never sends preview visits',async()=>{
  browser.location=new URL('https://preview.vercel.app/en');vi.stubGlobal('location',browser.location);await (await accept()).trackShopifyPageView();expect(fetcher).not.toHaveBeenCalled();
 });
 it('stops after refusal and during pending network requests',async()=>{
  const m=await accept();let finish:(r:Response)=>void=()=>{};
  fetcher.mockImplementation((_url:string,options:RequestInit)=>options.method==='DELETE'?Promise.resolve(new Response(null,{status:204})):new Promise(r=>{finish=r;}));
  const pending=m.trackShopifyPageView();m.setShopifyVisitConsent(false);finish(new Response(JSON.stringify({ok:true,shopId:SHOP})));await pending;
  expect(mocked.send).not.toHaveBeenCalled();expect(fetcher.mock.calls[0]?.[1].signal.aborted).toBe(true);
 });
 it('does not send mock identifiers or invent a session',async()=>{
  mocked.values.mockReturnValue({uniqueToken:'00000000-no-consent',visitToken:'visit',consent:'denied'});await (await accept()).trackShopifyPageView();expect(mocked.send).not.toHaveBeenCalled();
 });
 it('does not interrupt shopping when measurement fails',async()=>{
  fetcher.mockRejectedValue(new Error('offline'));await expect((await accept()).trackShopifyPageView()).resolves.toBeUndefined();expect(mocked.send).not.toHaveBeenCalled();
 });
});
