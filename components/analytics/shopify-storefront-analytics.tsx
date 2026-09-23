'use client';

import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {CONSENT_EVENT} from '@/lib/analytics/ga4';
import {trackShopifyPageView, stopPendingShopifyPageView} from '@/lib/analytics/shopify-visits';

/** Measures public page visits only. Does not modify carts or send purchase events. */
export function ShopifyStorefrontAnalytics() {
  const pathname = usePathname();
  useEffect(() => {
    const track = () => { void trackShopifyPageView(); };
    const timer = setTimeout(track, 0);
    window.addEventListener(CONSENT_EVENT, track);
    window.addEventListener('storage', track);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(CONSENT_EVENT, track);
      window.removeEventListener('storage', track);
      stopPendingShopifyPageView();
    };
  }, [pathname]);
  return null;
}
