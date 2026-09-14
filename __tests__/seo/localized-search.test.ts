import { describe, expect, it } from 'vitest';
import { matchesLocalizedTitle, normalizeSearchText } from '@/lib/localized-search';
import type { Product } from '@/lib/shopify/types';
describe('translated title matching', () => {
 it('matches Arabic words regardless of accents and letter variants', () => {
  expect(normalizeSearchText('إشْرَاق')).toBe('اشراق');
  expect(matchesLocalizedTitle({ title: 'قهوة أرابيكا البرازيلية' } as Product, 'قَهْوة ارابيكا', 'ar')).toBe(true);
 });
 it('requires every search word and rejects empty queries', () => {
  const product = { title: 'قهوة أرابيكا' } as Product;
  expect(matchesLocalizedTitle(product, 'قهوة شامبو', 'ar')).toBe(false);
  expect(matchesLocalizedTitle(product, ' ', 'ar')).toBe(false);
 });
});
