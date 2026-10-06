import type { Cart, CartItem, Money } from './types';

function cents(money: Money | undefined, currency: string): number | null {
  if (!money || money.currencyCode !== currency || money.amount.trim() === '') return null;
  const value = Number(money.amount);
  return Number.isFinite(value) && value >= 0 ? Math.round(value * 100) : null;
}

/** Only Shopify line costs; never infer membership or savings from compare-at prices. */
export function getLineDiscountDisplay(line: CartItem) {
  const currencyCode = line.cost.totalAmount.currencyCode;
  let before = cents(line.cost.subtotalAmount, currencyCode);
  const after = cents(line.cost.totalAmount, currencyCode);
  if (before === null || after === null || before < after) return null;
  // Allocations explicitly describe the savings applied to this line, including
  // discounts that Shopify has already reflected in its subtotal/unit amount.
  let allocated = 0;
  for (const discount of line.discountAllocations ?? []) {
    const amount = cents(discount.discountedAmount, currencyCode);
    if (amount === null) return null;
    allocated += amount;
  }
  if (allocated > 0) before = after + allocated;
  return { before: (before / 100).toFixed(2), savings: ((before - after) / 100).toFixed(2), currencyCode };
}

/** Item savings only. Cart-level discounts, delivery and taxes stay in Shopify's totals. */
export function getCartItemDiscountDisplay(cart: Cart | null | undefined) {
  if (!cart?.lines.length) return null;
  const currencyCode = cart.cost.subtotalAmount.currencyCode;
  let before = 0;
  let after = 0;
  for (const line of cart.lines) {
    const display = getLineDiscountDisplay(line);
    const lineTotal = cents(line.cost.totalAmount, currencyCode);
    if (!display || display.currencyCode !== currencyCode || lineTotal === null) return null;
    before += Math.round(Number(display.before) * 100);
    after += lineTotal;
  }
  // Do not invent a breakdown when Shopify's subtotal doesn't reconcile.
  if (after !== cents(cart.cost.subtotalAmount, currencyCode) || before <= after) return null;
  return { before: (before / 100).toFixed(2), savings: ((before - after) / 100).toFixed(2), currencyCode };
}

export function hasAppliedCartDiscount(cart: Cart | null | undefined): boolean {
  if (!cart) return false;
  return Boolean(cart.discountCodes?.some(code => code.applicable) ||
    cart.discountAllocations?.some(discount => Number(discount.discountedAmount.amount) > 0) ||
    cart.lines.some(line => line.discountAllocations?.some(discount => Number(discount.discountedAmount.amount) > 0) ||
      Number(getLineDiscountDisplay(line)?.savings ?? 0) > 0));
}
