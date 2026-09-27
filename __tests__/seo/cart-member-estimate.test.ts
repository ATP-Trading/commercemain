import { describe, expect, it } from 'vitest';
import { getCartMemberEstimate } from '@/lib/shopify/cart-member-estimate';
import { WATER_SOIL_COLLECTION_ID } from '@/lib/shopify/member-product-eligibility';
import type { Cart } from '@/lib/shopify/types';
const eligible = 'gid://shopify/Collection/447125127406';
function line(amount: string, collection?: string) {
  return { quantity: 1, cost: { totalAmount: { amount, currencyCode: 'AED' } }, merchandise: { product: { handle: 'product', collections: { edges: collection ? [{ node: { id: collection } }] : [] } } } };
}
function cart(lines: any[]): Cart { return { lines, cost: { subtotalAmount: { amount: '0', currencyCode: 'AED' } } } as Cart; }
describe('guest cart membership estimate', () => {
  it('shows 323 and 57 saving for an eligible 380 item', () => {
    expect(getCartMemberEstimate(cart([line('380', eligible)]))).toEqual({ total: '323.00', savings: '57.00', currencyCode: 'AED' });
  });
  it('uses extended quantity totals and category-specific rates', () => {
    expect(getCartMemberEstimate(cart([line('760', eligible), line('100', WATER_SOIL_COLLECTION_ID), line('50')]))).toEqual({ total: '786.00', savings: '124.00', currencyCode: 'AED' });
  });
  it('does not promise discounts with missing category information', () => {
    expect(getCartMemberEstimate(cart([line('380')]))).toBeNull();
  });
  it('does not stack existing discounts', () => {
    const discounted = cart([line('380', eligible)]);
    discounted.discountCodes = [{code:'SALE', applicable:true}];
    expect(getCartMemberEstimate(discounted)).toBeNull();
    discounted.discountCodes = [];
    discounted.lines[0]!.discountAllocations = [{discountedAmount:{amount:'10',currencyCode:'AED'}}];
    expect(getCartMemberEstimate(discounted)).toBeNull();
  });
});
