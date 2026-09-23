import 'server-only';
import { decodeCheckoutConsent, type CheckoutVisitorConsent } from '@/lib/analytics/checkout-consent';
import { shopifyFetch } from '@/lib/shopify/server';

// Storefront API 2025-10+; Shopify generates its own opaque consent parameter.
export const checkoutConsentQuery = /* GraphQL */ `
  query CheckoutConsentUrl($cartId: ID!, $visitorConsent: VisitorConsent!)
    @inContext(visitorConsent: $visitorConsent) {
    cart(id: $cartId) { checkoutUrl }
  }
`;

type CheckoutConsentOperation = {
  data: { cart: { checkoutUrl: string } | null };
  variables: { cartId: string; visitorConsent: CheckoutVisitorConsent };
};

export async function getConsentedCheckoutUrl(
  cartId: string | undefined,
  currentUrl: string,
  consentCookie: string | undefined,
): Promise<string> {
  const visitorConsent = decodeCheckoutConsent(consentCookie);
  // No recorded choice: leave native Shopify consent collection untouched.
  if (!visitorConsent) return currentUrl;
  if (!cartId) throw new Error('Unable to prepare checkout. Please try again.');

  const { body } = await shopifyFetch<CheckoutConsentOperation>({
    query: checkoutConsentQuery,
    variables: { cartId, visitorConsent },
  });
  const consentedUrl = body.data.cart?.checkoutUrl;
  let valid = false;
  try {
    const parsed = new URL(consentedUrl || '');
    valid = parsed.protocol === 'https:' && !!parsed.searchParams.get('_cs');
  } catch { /* Reject a missing or malformed URL without leaking cart tokens. */ }
  if (!valid || !consentedUrl) {
    // Do not silently discard an explicit refusal if the API contract fails.
    // This failure path requires live acceptance before production release.
    throw new Error('Unable to prepare checkout preferences. Please try again.');
  }
  return consentedUrl;
}
