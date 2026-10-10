'use client';
import { useEffect, useRef } from 'react';
import type { Cart } from '@/lib/shopify/types';
import { analyticsAllowed, CONSENT_EVENT, trackCart, trackPage } from '@/lib/analytics/ga4';
import { cartMeasurement } from '@/lib/analytics/cart-measurement';

export function CartAnalytics({ cart }: { cart: Cart | undefined }) {
  const sent = useRef(false);
  useEffect(() => {
    const track = () => {
      if (sent.current || !cart?.lines.length || !analyticsAllowed()) return;
      sent.current = true;
      trackPage();
      const data = cartMeasurement(cart);
      trackCart('view_cart', data.items, data.currency, data.value);
    };
    const timer = setTimeout(track, 0);
    window.addEventListener(CONSENT_EVENT, track);
    return () => { clearTimeout(timer); window.removeEventListener(CONSENT_EVENT, track); };
  }, [cart]);
  return null;
}
