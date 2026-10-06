/** ALKAMAG's published product descriptions specify a ten-day delivery window. */
export function isAlkamagProduct(handleOrUrl: string): boolean {
  return /(?:^|[\/-])alkamag(?:[\/-]|$)/i.test(handleOrUrl);
}

export function productDeliveryMessage(handle: string, locale: string): string {
  if (isAlkamagProduct(handle)) {
    return locale === 'ar'
      ? 'التوصيل خلال ١٠ أيام داخل الإمارات.'
      : 'Delivery within 10 days across the UAE.';
  }
  return locale === 'ar'
    ? 'التوصيل خلال ٤٨ ساعة داخل الإمارات، ما لم تُذكر مدة مختلفة في وصف المنتج.'
    : 'Delivery within 48 hours across the UAE, unless a different timeframe is stated in the product description.';
}
