import {measurementMode, staffMeasurementMode} from './measurement-mode';
import {getClientBrowserParameters, sendShopifyAnalytics} from '@shopify/hydrogen-react/analytics';
import {getTrackingValues} from '@shopify/hydrogen-react/tracking-utils';
import {safePageUrl} from './ga4';
import {normalizeCheckoutConsent} from '@/lib/cart/checkout-consent';

export const SHOPIFY_VISIT_CONSENT_KEY = 'atp-shopify-analytics-consent-v1';
const ENDPOINT = '/api/analytics/shopify';
let storageBlocked = false;
let sequence = 0;
let lastPage = '';
let lastPageKey = '';
let pending: {key: string; controller: AbortController; promise: Promise<void>} | null = null;

export function hasShopifyVisitChoice() {
  if (typeof window === 'undefined') return false;
  try { return ['granted', 'denied'].includes(localStorage.getItem(SHOPIFY_VISIT_CONSENT_KEY) || ''); }
  catch { return false; }
}
export function shopifyVisitsAllowed() {
  if (storageBlocked || typeof window === 'undefined' || location.origin !== 'https://www.atpgroupservices.ae' || staffMeasurementMode() !== 'normal' || navigator.doNotTrack === '1' || (navigator as Navigator & {globalPrivacyControl?: boolean}).globalPrivacyControl) return false;
  try { return localStorage.getItem(SHOPIFY_VISIT_CONSENT_KEY) !== 'denied'; }
  catch { return false; }
}
export function shopifyCheckoutConsent() {
  // Never turn a Google-only analytics choice into consent for Shopify.
  // Checkout tests must not create ordinary Shopify marketing/analytics events.
  return normalizeCheckoutConsent({analytics: measurementMode() !== 'normal' ? false
    : hasShopifyVisitChoice() ? shopifyVisitsAllowed() : null});
}
function cancel() {
  sequence++;
  pending?.controller.abort();
  pending = null;
}
export function setShopifyVisitConsent(granted: boolean) {
  if (typeof window === 'undefined') return;
  const wasAllowed = shopifyVisitsAllowed();
  try {
    localStorage.setItem(SHOPIFY_VISIT_CONSENT_KEY, granted ? 'granted' : 'denied');
    storageBlocked = false;
  } catch { storageBlocked = true; }
  if (!granted || storageBlocked) {
    cancel(); lastPage = ''; lastPageKey = '';
    if (wasAllowed) void fetch(ENDPOINT, {
      method: 'DELETE', credentials: 'same-origin', cache: 'no-store',
      headers: {'X-ATP-Analytics-Consent': 'v2'},
    }).catch(() => {});
  }
}
export function shopifyPageUrl() {
  if (typeof window === 'undefined' || !shopifyVisitsAllowed()) return '';
  // Never send account details, search inputs, payment tokens, or private page titles.
  if (!/^\/(en|ar)(\/|$)/.test(location.pathname) || /\/(account|auth|checkout|checkouts|login|signup|search|api)(\/|$)/i.test(location.pathname)) return '';
  return safePageUrl(location.href);
}
type Privacy = {cachedConsent?: string; backendConsentEnabled?: boolean; analyticsProcessingAllowed?: () => boolean; getRegion?: () => string};
let privacyScript: Promise<boolean> | undefined;
async function permittedByShopify(consent: string) {
  const host = window as unknown as {Shopify?: {customerPrivacy?: Privacy}};
  const shop = host.Shopify ??= {};
  const privacy = shop.customerPrivacy ??= {};
  privacy.cachedConsent = consent;
  privacy.backendConsentEnabled = true;
  if (!privacy.analyticsProcessingAllowed) {
    privacyScript ??= new Promise(resolve => {
      const script = document.createElement('script');
      script.src = 'https://cdn.shopify.com/shopifycloud/consent-tracking-api/v0.2/consent-tracking-api.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
    if (!await privacyScript) return false;
  }
  const api = shop.customerPrivacy;
  return Boolean(api?.getRegion?.()) && api?.analyticsProcessingAllowed?.() === true;
}
export function trackShopifyPageView(): Promise<void> {
  const pageUrl = shopifyPageUrl();
  if (!pageUrl) { cancel(); lastPageKey = ''; return Promise.resolve(); }
  const key = safePageUrl(pageUrl, {campaign: true});
  if (key === lastPageKey) return Promise.resolve();
  if (pending?.key === key) return pending.promise;
  cancel();
  const ticket = sequence;
  const controller = new AbortController();
  const promise = (async () => {
    try {
      async function readState(purpose: 'bootstrap' | 'page') {
        const response = await fetch(ENDPOINT, {
          method: 'POST', credentials: 'same-origin', cache: 'no-store',
          headers: {'Content-Type': 'application/json', 'X-ATP-Analytics-Consent': 'v2'},
          body: JSON.stringify({purpose}), signal: controller.signal,
        });
        if (!response.ok) return null;
        const result = await response.json();
        if (!result.ok || result.shopId !== 'gid://shopify/Shop/72307441902') return null;
        return getTrackingValues();
      }
      const initial = await readState('bootstrap');
      if (!initial?.consent || !await permittedByShopify(initial.consent)) return;
      if (ticket !== sequence || !shopifyPageUrl()) return;
      const values = await readState('page');
      if (!values) return;
      const latestPage = shopifyPageUrl();
      if (ticket !== sequence || controller.signal.aborted || !latestPage || key !== safePageUrl(latestPage, {campaign: true})) return;
      if (!values.uniqueToken || !values.visitToken || [values.uniqueToken, values.visitToken].some(v => v.startsWith('00000000-'))) return;
      if (!values.consent || !await permittedByShopify(values.consent)) return;
      if (ticket !== sequence || controller.signal.aborted || shopifyPageUrl() !== latestPage) return;
      const url = new URL(latestPage);
      const referrer = safePageUrl(lastPage || document.referrer);
      lastPage = latestPage; lastPageKey = key; // Changing only ad consent is not a new page view.
      await sendShopifyAnalytics({eventName: 'PAGE_VIEW', payload: {
        ...getClientBrowserParameters(),
        shopId: 'gid://shopify/Shop/72307441902', shopifySalesChannel: 'headless',
        hasUserConsent: true, analyticsAllowed: true, marketingAllowed: false, saleOfDataAllowed: false,
        uniqueToken: values.uniqueToken, visitToken: values.visitToken,
        currency: 'AED', acceptedLanguage: url.pathname.startsWith('/ar') ? 'AR' : 'EN',
        url: latestPage, path: url.pathname, search: url.search,
        referrer, title: document.title.slice(0, 250), canonicalUrl: `${url.origin}${url.pathname}`,
      }});
    } catch { /* Analytics must never interrupt browsing, cart, or checkout. */ }
    finally { if (ticket === sequence) pending = null; }
  })();
  pending = {key, controller, promise};
  return promise;
}
export function stopPendingShopifyPageView() { cancel(); }


export async function trackShopifyAddToCart(input: {
  cartId: string; productId: string; variantId: string; name: string; price: number; quantity: number;
}) {
  if (measurementMode() !== 'normal' || !shopifyVisitsAllowed() || !/^gid:\/\/shopify\/Cart\/[^?]+$/.test(input.cartId)) return;
  const page = shopifyPageUrl();
  try {
    await trackShopifyPageView();
    if (!shopifyVisitsAllowed() || !page || lastPageKey !== safePageUrl(page, {campaign: true})) return;
    const values = getTrackingValues();
    if (!values.uniqueToken || !values.visitToken || [values.uniqueToken, values.visitToken].some(v => v.startsWith('00000000-'))) return;
    const url = new URL(page);
    await sendShopifyAnalytics({eventName: 'ADD_TO_CART', payload: {
      ...getClientBrowserParameters(), shopId: 'gid://shopify/Shop/72307441902',
      shopifySalesChannel: 'headless', hasUserConsent: true,
      analyticsAllowed: true, marketingAllowed: false, saleOfDataAllowed: false,
      uniqueToken: values.uniqueToken, visitToken: values.visitToken,
      currency: 'AED', acceptedLanguage: url.pathname.startsWith('/ar') ? 'AR' : 'EN',
      url: page, path: url.pathname, search: url.search, referrer: safePageUrl(document.referrer),
      title: document.title.slice(0, 250), cartId: input.cartId,
      totalValue: input.price * input.quantity,
      products: [{productGid: input.productId, variantGid: input.variantId, name: input.name,
        brand: '', price: String(input.price), quantity: input.quantity}],
    }});
  } catch { /* A tracking outage cannot undo a successful cart mutation. */ }
}
