import type { Cart } from '@/lib/shopify/types'
import { createCart } from '@/lib/shopify/server'

/** Only call from a route or server action where the cart cookie can be updated. */
export async function cartForSession(cart: Cart, accessToken: string | null): Promise<Cart> {
  if (accessToken || !cart.buyerIdentity?.customer) return cart

  // A login can expire while its Shopify cart is still linked to the customer.
  // Copy purchase lines into a guest cart, never the previous buyer or discounts.
  // If recreation fails, propagate the error rather than exposing the old checkout.
  return createCart(cart.lines.map(line => ({
    merchandiseId: line.merchandise.id,
    quantity: line.quantity,
    ...(line.sellingPlanAllocation?.sellingPlan.id
      ? { sellingPlanId: line.sellingPlanAllocation.sellingPlan.id }
      : {}),
  })))
}
