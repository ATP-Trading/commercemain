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
    {failed && <div role="alert" className="mt-3 space-y-2 text-sm text-red-400">
      <p>{ar ? 'تعذر تأكيد حسابك وخصوماتك للدفع. أعد المحاولة، أو سجّل الدخول من جديد للمتابعة.' : 'We could not verify your account and discounts for checkout. Retry, or sign in again to continue.'}</p>
      <a className="inline-flex min-h-11 items-center underline underline-offset-4" href={`/api/auth/login?returnTo=${encodeURIComponent(ar ? '/ar/cart' : '/en/cart')}`}>
        {ar ? 'تسجيل الدخول من جديد' : 'Sign in again'}
      </a>
    </div>}
  </form>;
}
