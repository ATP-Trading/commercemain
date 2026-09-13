import { describe, expect, it } from 'vitest';
import { normalizeNavigationUrl, localizeNavigationPath } from '@/lib/navigation-url';

describe('store navigation destinations', () => {
  it.each([
    'https://www.instagram.com/atp_trading/?hl=ar#profile',
    'https://example.com/collections/skincare?source=menu',
    'mailto:info@atpgroupservices.ae',
    'tel:+971569586422',
    '//example.com/store',
    '#products',
  ])('preserves an external or special destination: %s', (url) => {
    expect(localizeNavigationPath(normalizeNavigationUrl(url), 'ar')).toBe(url);
  });
  it('keeps the query and fragment on internal links', () => {
    expect(localizeNavigationPath(normalizeNavigationUrl('https://www.atpgroupservices.ae/en/search?q=water#products'), 'ar'))
      .toBe('/ar/search?q=water#products');
  });
  it('does not confuse a route starting with the locale letters with a locale prefix', () => {
    expect(localizeNavigationPath('/ingredients', 'en')).toBe('/en/ingredients');
    expect(localizeNavigationPath('/aroma', 'ar')).toBe('/ar/aroma');
  });
  it('replaces an existing language without duplicating it', () => {
    expect(localizeNavigationPath('/en/collections/skincare', 'ar')).toBe('/ar/collections/skincare');
    expect(localizeNavigationPath('/ar/collections/skincare', 'ar')).toBe('/ar/collections/skincare');
  });
});
