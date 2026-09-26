import { describe, expect, it } from 'vitest';
import { filterCollectionProducts, productCategory } from '@/lib/collection-categories';
import type { Product } from '@/lib/shopify/types';
const product = (id: string, tags: string[] = []) => ({id: `gid://shopify/Product/${id}`, tags}) as Product;
describe('collection categories', () => {
 it('preserves Shopify ranking within a category and retains unknown products in all', () => {
  const items = [product('8757286961390'), product('8757286273262'), product('8877054492910'), product('new')];
  expect(filterCollectionProducts(items, 'supplements').products).toEqual([items[0],items[2]]);
  expect(filterCollectionProducts(items, 'invalid').products).toEqual(items);
  expect(filterCollectionProducts(items, undefined).categories.map(c=>c.value)).toEqual(['supplements','beauty']);
 });
 it('supports new Shopify category tags and overrides legacy mapping', () => {
  expect(productCategory(product('new', ['category:beauty']))).toBe('beauty');
  expect(productCategory(product('8757286961390', ['category:drinks']))).toBe('drinks');
 });
});
