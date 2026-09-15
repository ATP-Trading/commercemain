import { describe, expect, it } from 'vitest';
import { stockLimit, remainingStock, assertStockQuantity } from '@/lib/shopify/inventory-limit';
describe('sellable stock', () => {
 it('subtracts cart quantity and does not allow a negative remainder', () => {
  expect(remainingStock({ quantityAvailable: 5 }, 3)).toBe(2);
  expect(remainingStock({ quantityAvailable: 2 }, 3)).toBe(0);
 });
 it('rejects overselling and invalid quantities', () => {
  for (const quantity of [6, -1, 1.5, NaN, Infinity]) expect(() => assertStockQuantity({ quantityAvailable: 5 }, quantity)).toThrow('STOCK_LIMIT');
  expect(() => assertStockQuantity({ quantityAvailable: 5 }, 5)).not.toThrow();
 });
 it('preserves unknown stock and backorders and blocks sold out variants', () => {
  expect(stockLimit({ quantityAvailable: null })).toBeUndefined();
  expect(stockLimit({ quantityAvailable: -2, currentlyNotInStock: true, availableForSale: true })).toBeUndefined();
  expect(stockLimit({ availableForSale: false, quantityAvailable: 5 })).toBe(0);
 });
});
