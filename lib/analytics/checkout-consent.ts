// Our own host-only session cookie carries privacy choices to Server Actions.
// Never read or modify Shopify's private consent cookies or encode _cs ourselves.
export const CHECKOUT_CONSENT_COOKIE = 'atp-checkout-consent-v1';
const ANALYTICS_KEY = 'atp-analytics-consent';
const GOOGLE_ADS_KEY = 'atp-google-ads-consent-v1';

export type CheckoutVisitorConsent = {
  analytics: boolean;
  marketing: boolean;
  preferences: false;
  saleOfData: false;
};

export function decodeCheckoutConsent(value: string | undefined): CheckoutVisitorConsent | null {
  // Only the three choices the current banner actually offers are valid.
  if (value !== 'v1.0.0' && value !== 'v1.1.0' && value !== 'v1.1.1') return null;
  return {
    analytics: value[3] === '1',
    marketing: value[5] === '1',
    // The banner does not separately request these optional purposes.
    preferences: false,
    saleOfData: false,
  };
}

export function storedCheckoutConsent(storage: Pick<Storage, 'getItem'>): string | null {
  const analytics = storage.getItem(ANALYTICS_KEY);
  const advertising = storage.getItem(GOOGLE_ADS_KEY);
  if (![analytics, advertising].every(v => v === 'granted' || v === 'denied')) return null;
  // A legacy Meta-only grant is never interpreted as Google advertising consent.
  const allowAnalytics = analytics === 'granted';
  return `v1.${allowAnalytics ? 1 : 0}.${allowAnalytics && advertising === 'granted' ? 1 : 0}`;
}

export function syncCheckoutConsentCookie(storageBlocked = false): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window.location.hostname !== 'www.atpgroupservices.ae') return;
  let value: string | null = null;
  try {
    if (!storageBlocked) value = storedCheckoutConsent(window.localStorage);
  } catch { /* A failed read must not preserve an old grant. */ }
  try {
    // No identifiers, no cross-subdomain scope, and no persistent tracking lifetime.
    document.cookie = value
      ? `${CHECKOUT_CONSENT_COOKIE}=${value}; Path=/; SameSite=Lax; Secure`
      : `${CHECKOUT_CONSENT_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax; Secure`;
  } catch { /* Cookies may be unavailable; never interrupt the consent UI. */ }
}
