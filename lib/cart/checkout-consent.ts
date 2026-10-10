export type CheckoutConsent = { analytics: boolean | null; marketing: false; preferences: false; saleOfData: false };

// Browser input can express a choice, never an identity or arbitrary API input.
export function normalizeCheckoutConsent(value: unknown): CheckoutConsent {
  const analytics = value && typeof value === 'object' && 'analytics' in value ? value.analytics : null;
  return { analytics: typeof analytics === 'boolean' ? analytics : null,
    marketing: false, preferences: false, saleOfData: false };
}

export const checkoutConsentQuery = /* GraphQL */ `
  query checkoutWithConsent($cartId: ID!, $consent: VisitorConsent!) @inContext(visitorConsent: $consent) {
    cart(id: $cartId) { checkoutUrl }
  }
`;
