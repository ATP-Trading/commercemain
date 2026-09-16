import { describe, expect, it } from 'vitest';
import { reshapeCart } from '@/lib/shopify/client';
import type { ShopifyCart } from '@/lib/shopify/types';

const money = (amount: string) => ({ amount, currencyCode: 'AED' });
function cartWithTotal(total: string): ShopifyCart {
  return {
    id: 'test-cart', checkoutUrl: 'https://example.com/checkout', totalQuantity: 1,
    lines: { edges: [{ node: {
      id: 'line', quantity: 1, cost: { totalAmount: money('185.00') },
      merchandise: { id: 'variant', product: { id: 'product', title: 'Product', handle: 'product' } },
    } }] },
    cost: {
      subtotalAmount: money('185.00'), totalAmount: money(total),
      subtotalAmountEstimated: false, totalAmountEstimated: true,
      checkoutChargeAmount: money(total),
    },
  } as ShopifyCart;
}

describe('Shopify cart pricing', () => {
  it('preserves an order-level discount that is not part of line totals', () => {
    const cart = cartWithTotal('157.25');
    const result = reshapeCart(cart);
    expect(result.cost).toEqual(cart.cost);
    expect(result.lines[0].cost.totalAmount.amount).toBe('185.00');
  });

  it('preserves delivery charges already included by Shopify', () => {
    const cart = cartWithTotal('200.00');
    expect(reshapeCart(cart).cost).toEqual(cart.cost);
  });

  it('keeps Shopify estimate flags and checkout charge', () => {
    const result = reshapeCart(cartWithTotal('185.00'));
    expect(result.cost.totalAmountEstimated).toBe(true);
    expect(result.cost.subtotalAmountEstimated).toBe(false);
    expect(result.cost.checkoutChargeAmount).toEqual(money('185.00'));
  });

  it('retains the payable total when product text needs a fallback', () => {
    const cart = cartWithTotal('157.25');
    cart.lines.edges[0].node.merchandise.product.handle = '';
    expect(reshapeCart(cart).cost.totalAmount.amount).toBe('157.25');
  });
});
