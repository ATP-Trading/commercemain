import {measurementMode} from './measurement-mode';
import {getClientBrowserParameters, sendShopifyAnalytics} from '@shopify/hydrogen-react/analytics';
import {getTrackingValues} from '@shopify/hydrogen-react/tracking-utils';
import {analyticsAllowed, measurementPageUrl, safePageUrl} from './ga4';
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
  if (storageBlocked || measurementMode() !== 'normal' || !analyticsAllowed()) return false;
  try { return localStorage.getItem(SHOPIFY_VISIT_CONSENT_KEY) === 'granted'; }
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
      headers: {'X-ATP-Analytics-Consent': 'v1'},
    }).catch(() => {});
  }
}
export function shopifyPageUrl() {
  if (typeof window === 'undefined' || !shopifyVisitsAllowed()) return '';
  // Never send account details, search inputs, payment tokens, or private page titles.
  if (!/^\/(en|ar)(\/|$)/.test(location.pathname) || /\/(account|auth|checkout|checkouts|login|signup|search|api)(\/|$)/i.test(location.pathname)) return '';
  return measurementPageUrl();
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
      const response = await fetch(ENDPOINT, {
        method: 'POST', credentials: 'same-origin', cache: 'no-store',
        headers: {'Content-Type': 'application/json', 'X-ATP-Analytics-Consent': 'v1'},
        body: JSON.stringify({analytics: true}), signal: controller.signal,
      });
      if (!response.ok) return;
      const result = await response.json(); // Finish resource timing before asking the SDK for tokens.
      if (!result.ok || result.shopId !== 'gid://shopify/Shop/72307441902') return;
      const latestPage = shopifyPageUrl();
      if (ticket !== sequence || controller.signal.aborted || !latestPage || key !== safePageUrl(latestPage, {campaign: true})) return;
      const values = getTrackingValues();
      if (!values.uniqueToken || !values.visitToken || [values.uniqueToken, values.visitToken].some(v => v.startsWith('00000000-'))) return;
      const url = new URL(latestPage);
      const referrer = safePageUrl(lastPage || document.referrer);
      lastPage = latestPage; lastPageKey = key; // Changing only ad consent is not a new page view.
      await sendShopifyAnalytics({eventName: 'PAGE_VIEW', payload: {
        ...getClientBrowserParameters(),
        shopId: result.shopId, shopifySalesChannel: 'headless',
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
  if (!shopifyVisitsAllowed() || !/^gid:\/\/shopify\/Cart\/[^?]+$/.test(input.cartId)) return;
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
