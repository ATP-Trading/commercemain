import type { Cart } from './types';
import { getMemberDiscountRate } from './member-product-eligibility';

/** A guest comparison only. Never changes Shopify totals or combines existing offers. */
export function getCartMemberEstimate(cart: Cart | null | undefined) {
  if (!cart?.lines?.length || cart.discountCodes?.some(code => code.applicable) ||
      cart.discountAllocations?.some(discount => Number(discount.discountedAmount.amount) > 0)) return null;
  const currencyCode = cart.cost.subtotalAmount.currencyCode;
  let subtotal = 0;
  let savings = 0;
  for (const line of cart.lines) {
    if (line.sellingPlanAllocation || line.discountAllocations?.some(discount => Number(discount.discountedAmount.amount) > 0)) return null;
    const amount = Number(line.cost.totalAmount.amount);
    if (!Number.isFinite(amount) || amount < 0 || line.cost.totalAmount.currencyCode !== currencyCode) return null;
    const cents = Math.round(amount * 100);
    subtotal += cents;
    savings += Math.round(cents * getMemberDiscountRate(line.merchandise.product));
  }
  if (savings <= 0) return null;
  return { total: ((subtotal - savings) / 100).toFixed(2), savings: (savings / 100).toFixed(2), currencyCode };
}
