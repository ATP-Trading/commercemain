import type { Cart, CartItem } from '@/lib/shopify/types';
import type { AnalyticsItem } from './ga4';

export function cartAnalyticsItem(line: CartItem, quantity = line.quantity): AnalyticsItem {
  return { item_id: line.merchandise.product.id, item_name: line.merchandise.product.title,
    price: Number(line.cost.totalAmount.amount) / line.quantity, quantity };
}
export function cartMeasurement(cart: Cart | undefined) {
  const lines = cart?.lines || [];
  return { items: lines.filter(line => line.quantity > 0).map(line => cartAnalyticsItem(line)),
    currency: cart?.cost.subtotalAmount.currencyCode || 'AED',
    value: Number(cart?.cost.subtotalAmount.amount || 0) };
}
