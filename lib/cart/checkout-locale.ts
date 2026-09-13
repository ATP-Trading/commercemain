/** Preserve Shopify's cart/session parameters while selecting the storefront language. */
export function localizeCheckoutUrl(checkoutUrl: string, locale: string): string {
  const url = new URL(checkoutUrl);
  url.searchParams.set('locale', locale === 'ar' ? 'ar' : 'en');
  return url.toString();
}
