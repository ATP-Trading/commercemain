// Public measurement ID of the existing Shopify-connected GA4 stream.
export const GA4_ID = 'G-N47GG1EVK5';
export const CONSENT_KEY = 'atp-analytics-consent';
export const CONSENT_EVENT = 'atp-analytics-consent-changed';
export const SETTINGS_EVENT = 'atp-analytics-settings';

let initialized = false;
let lastPage = '';
const viewedProducts = new Set<string>();

export function analyticsAllowed() {
  if (typeof window === 'undefined') return false;
  try {
    return window.location.hostname === 'www.atpgroupservices.ae' &&
      localStorage.getItem(CONSENT_KEY) === 'granted';
  } catch { return false; }
}

export function safePageUrl(value: string) {
  try {
    const url = new URL(value);
    // Account IDs, OAuth codes, search input and checkout tokens stay out of GA4.
    const path = url.pathname.replace(/\/(account|auth|checkout)(?:\/.*)?$/, '/$1');
    return `${url.origin}${path}`;
  } catch { return ''; }
}

function command(...args: unknown[]) {
  const w = window as Window & { dataLayer?: unknown[] };
  w.dataLayer ||= [];
  // gtag.js expects the Arguments object, not an array.
  w.dataLayer.push(arguments);
}

export function initializeGA4() {
  if (!analyticsAllowed() || initialized) return;
  initialized = true;
  command('consent', 'default', {
    analytics_storage: 'granted', ad_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied',
  });
  command('js', new Date());
  command('config', GA4_ID, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_domain: 'atpgroupservices.ae',
    page_location: safePageUrl(window.location.href),
    page_referrer: safePageUrl(document.referrer),
  });
  const script = document.createElement('script');
  script.id = 'atp-ga4';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script);
}

export function trackPage() {
  if (!analyticsAllowed()) return;
  initializeGA4();
  const page = safePageUrl(window.location.href);
  if (page === lastPage) return;
  const referrer = lastPage || safePageUrl(document.referrer);
  lastPage = page;
  viewedProducts.clear();
  command('set', { page_location: page, page_referrer: referrer });
  command('event', 'page_view', {
    send_to: GA4_ID, page_location: page, page_referrer: referrer,
    // Private account and search pages can have customer-provided titles.
    page_title: /\/(account|auth|search|checkout)(\/|$)/.test(new URL(page).pathname)
      ? 'ATP Trading' : document.title,
  });
}

export type AnalyticsItem = { item_id: string; item_name: string; price: number; quantity: number };
export function trackProduct(event: 'view_item' | 'add_to_cart', item: AnalyticsItem, currency: string) {
  if (!analyticsAllowed()) return;
  initializeGA4();
  if (event === 'view_item') {
    if (viewedProducts.has(item.item_id)) return;
    viewedProducts.add(item.item_id);
  }
  command('event', event, { send_to: GA4_ID, currency,
    value: item.price * item.quantity, items: [item],
    page_location: safePageUrl(window.location.href),
  });
}

export function setAnalyticsConsent(granted: boolean) {
  try { localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied'); } catch { return; }
  if (!granted) {
    (window as unknown as Record<string, unknown>)[`ga-disable-${GA4_ID}`] = true;
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.trim().split('=')[0];
      if (name === '_ga' || name.startsWith('_ga_')) {
        for (const domain of ['', '; domain=atpgroupservices.ae', '; domain=www.atpgroupservices.ae']) {
          document.cookie = `${name}=; Max-Age=0; path=/${domain}`;
        }
      }
    }
  } else {
    (window as unknown as Record<string, unknown>)[`ga-disable-${GA4_ID}`] = false;
  }
  lastPage = '';
  viewedProducts.clear();
  window.dispatchEvent(new Event(CONSENT_EVENT));
}
