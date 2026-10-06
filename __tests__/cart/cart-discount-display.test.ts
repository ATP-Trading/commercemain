import { describe, expect, it } from 'vitest';
import { getCartItemDiscountDisplay, getLineDiscountDisplay, hasAppliedCartDiscount } from '@/lib/shopify/cart-discount-display';
import type { Cart, CartItem } from '@/lib/shopify/types';

const money = (amount: string, currencyCode = 'AED') => ({ amount, currencyCode });
function line(before = '440', after = '374'): CartItem {
  return { quantity: 2, cost: { amountPerQuantity: money('220'), subtotalAmount: money(before), totalAmount: money(after) } } as CartItem;
}
function cart(lines = [line()], subtotal = '374', total = subtotal): Cart {
  return { lines, cost: { subtotalAmount: money(subtotal), totalAmount: money(total) } } as Cart;
}
describe('Shopify discount presentation', () => {
  it('explains the observed two-collagen 440 → 374 cart without changing its payable amount', () => {
    const input = cart();
    expect(getCartItemDiscountDisplay(input)).toEqual({ before: '440.00', savings: '66.00', currencyCode: 'AED' });
    expect(input.cost.totalAmount.amount).toBe('374');
    expect(hasAppliedCartDiscount(input)).toBe(true);
  });
  it('does not show a discount for ordinary prices or compare-at marketing prices', () => {
    const input = line('440', '440');
    input.cost.compareAtAmountPerQuantity = money('300');
    expect(getCartItemDiscountDisplay(cart([input], '440'))).toBeNull();
    expect(hasAppliedCartDiscount(cart([input], '440'))).toBe(false);
  });
  it('does not include shipping or a cart-level discount in item savings', () => {
    expect(getCartItemDiscountDisplay(cart([line()], '374', '389'))?.savings).toBe('66.00');
    expect(getCartItemDiscountDisplay(cart([line()], '374', '350'))?.savings).toBe('66.00');
  });
  it('hides stale line details during an optimistic quantity update', () => {
    const input = line();
    input.quantity = 3;
    input.cost.totalAmount = money('561');
    input.cost.subtotalAmount = undefined;
    expect(getLineDiscountDisplay(input)).toBeNull();
    expect(getCartItemDiscountDisplay(cart([input], '561'))).toBeNull();
  });
  it('uses the explicit subtotal even when the unit amount already reflects a discount', () => {
    const input = line();
    input.cost.amountPerQuantity = money('187');
    expect(getCartItemDiscountDisplay(cart([input]))?.savings).toBe('66.00');
  });
  it('uses actual line allocations when Shopify already discounted the subtotal', () => {
    const input = line('374', '374');
    input.cost.amountPerQuantity = money('187');
    input.discountAllocations = [{ discountedAmount: money('66') }];
    expect(getCartItemDiscountDisplay(cart([input]))).toEqual({ before: '440.00', savings: '66.00', currencyCode: 'AED' });
  });
  it('rejects missing, invalid, mismatched-currency and inconsistent amounts', () => {
    const missing = line();
    delete missing.cost.subtotalAmount;
    expect(getLineDiscountDisplay(missing)).toBeNull();
    expect(getLineDiscountDisplay(line('NaN'))).toBeNull();
    const foreign = line();
    foreign.cost.subtotalAmount = money('440', 'USD');
    expect(getLineDiscountDisplay(foreign)).toBeNull();
    expect(getCartItemDiscountDisplay(cart([line()], '400'))).toBeNull();
  });
  it('suppresses the membership upsell for an applied offer without declaring membership', () => {
    const input = cart([line('440', '440')], '440');
    input.discountCodes = [{ code: 'OFFER', applicable: false }];
    expect(hasAppliedCartDiscount(input)).toBe(false);
    input.discountCodes[0]!.applicable = true;
    expect(hasAppliedCartDiscount(input)).toBe(true);
  });
});

// Exercise the query module imported by server.ts, not the separate fragment module.
import { getCartQuery, createCartMutation, addToCartMutation, editCartItemsMutation, removeFromCartMutation, getCartWithSellingPlansQuery } from '@/lib/shopify/queries';
it.each([getCartQuery, createCartMutation, addToCartMutation, editCartItemsMutation, removeFromCartMutation, getCartWithSellingPlansQuery])('fetches the before-discount amount for cart lines on every cart operation', query => {
  const lineSelection = query.slice(query.indexOf('lines(first:'));
  const lineCost = lineSelection.match(/cost\s*\{([\s\S]*?)merchandise/);
  expect(lineCost?.[1]).toContain('subtotalAmount');
  expect(lineCost?.[1]).toContain('totalAmount');
});
