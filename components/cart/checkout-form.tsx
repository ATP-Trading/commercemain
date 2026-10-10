'use client';
import { useState, type ReactNode } from 'react';
import { useLocale } from 'next-intl';
import { getCheckoutUrl } from './actions';
import { useCart } from './cart-context';
import { cartMeasurement } from '@/lib/analytics/cart-measurement';
import { trackCheckoutClick } from '@/lib/analytics/ga4';
import { shopifyCheckoutConsent } from '@/lib/analytics/shopify-visits';

export function CheckoutForm({ children, className }: { children: ReactNode; className?: string }) {
  const { cart } = useCart();
  const ar = useLocale() === 'ar';
  const [failed, setFailed] = useState(false);
  const checkout = async () => {
    setFailed(false);
    try {
      // Obtain a validated checkout for the current session before counting a click.
      const url = await getCheckoutUrl(shopifyCheckoutConsent());
      const data = cartMeasurement(cart);
      try { await trackCheckoutClick(data.items, data.currency, data.value); }
      catch { /* An analytics failure must never prevent payment. */ }
      window.location.assign(url);
    } catch { setFailed(true); }
  };
  return <form action={checkout} className={className}>
    {children}
    {failed && <p role="alert" className="mt-2 text-sm text-red-400">{ar ? 'تعذر فتح الدفع. يرجى المحاولة مرة أخرى.' : 'Could not open checkout. Please try again.'}</p>}
  </form>;
}
