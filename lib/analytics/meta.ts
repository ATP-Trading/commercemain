// Same dataset as the Shopify Facebook & Instagram channel.
export const META_PIXEL_ID = '24439733515663379';
export const MARKETING_CONSENT_KEY = 'atp-marketing-consent';
export const MARKETING_CONSENT_EVENT = 'atp-marketing-consent-changed';
let initialized = false;
let lastPage = '';

type Pixel = ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue: unknown[][]; push?: Pixel; loaded: boolean; version: string };

export function marketingAllowed() {
  try {
    return window.location.hostname === 'www.atpgroupservices.ae' && localStorage.getItem(MARKETING_CONSENT_KEY) === 'granted';
  } catch { return false; }
}

export function trackMetaPage() {
  if (!marketingAllowed()) return;
  // Do not send account, authentication, search or payment page URLs to Meta.
  const path = window.location.pathname;
  if (/\/(account|auth|login|signup|search|checkout)(\/|$)/.test(path)) return;
  if (!initialized) {
    if (!window.fbq) {
      const pixel = function (...args: unknown[]) {
        pixel.callMethod ? pixel.callMethod(...args) : pixel.queue.push(args);
      } as Pixel;
      pixel.queue = []; pixel.loaded = true; pixel.version = '2.0'; pixel.push = pixel;
      window.fbq = pixel; window._fbq = pixel;
    }
    window.fbq('consent', 'grant');
    window.fbq('init', META_PIXEL_ID);
    if (!document.getElementById('atp-meta-pixel')) {
      const script = document.createElement('script');
      script.id = 'atp-meta-pixel'; script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(script);
    }
    initialized = true;
  }
  if (path === lastPage) return;
  lastPage = path;
  window.fbq('trackSingle', META_PIXEL_ID, 'PageView');
}

export function setMarketingConsent(granted: boolean) {
  try { localStorage.setItem(MARKETING_CONSENT_KEY, granted ? 'granted' : 'denied'); } catch { return; }
  if (window.fbq) window.fbq('consent', granted ? 'grant' : 'revoke');
  if (!granted) {
    for (const name of ['_fbp', '_fbc']) {
      for (const domain of ['', '; domain=atpgroupservices.ae', '; domain=www.atpgroupservices.ae']) {
        document.cookie = `${name}=; Max-Age=0; path=/${domain}`;
      }
    }
  }
  lastPage = '';
  window.dispatchEvent(new Event(MARKETING_CONSENT_EVENT));
}
