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
