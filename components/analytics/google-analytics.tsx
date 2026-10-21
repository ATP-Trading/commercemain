'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { setMarketingConsent } from '@/lib/analytics/meta';
import { CONSENT_EVENT, setAnalyticsConsent, trackPage, trackProduct, type AnalyticsItem } from '@/lib/analytics/ga4';

// Revoke saved choices, including those from before optional tracking was disabled.
export function GoogleAnalytics() {
  useEffect(() => {
    setAnalyticsConsent(false, false);
    setMarketingConsent(false);
    try { localStorage.setItem('atp-shopify-analytics-consent-v1', 'denied'); } catch {}
    for (const name of ['_shopify_y', '_shopify_s', '_shopify_sa_t', '_shopify_sa_p']) {
      for (const domain of ['', '; domain=atpgroupservices.ae', '; domain=www.atpgroupservices.ae']) {
        document.cookie = `${name}=; Max-Age=0; path=/${domain}`;
      }
    }
    // First-party cleanup only: clears HttpOnly analytics cookies, preserves cart/login cookies.
    void fetch('/api/analytics/shopify', { method: 'DELETE', headers: { 'x-atp-analytics-consent': 'v1' } }).catch(() => {});
  }, []);
  return null;
}
export function AnalyticsSettingsButton() { return null; }

export function ProductAnalytics({ item, currency }: { item: AnalyticsItem; currency: string }) {
  const pathname = usePathname();
  useEffect(() => {
    const track = () => { trackPage(); trackProduct('view_item', item, currency); };
    const timer = setTimeout(track, 0);
    window.addEventListener(CONSENT_EVENT, track);
    return () => { clearTimeout(timer); window.removeEventListener(CONSENT_EVENT, track); };
  }, [pathname, item.item_id, item.item_name, item.price, item.quantity, currency]);
  return null;
}
