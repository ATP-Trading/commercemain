import React from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { render, waitFor, cleanup, fireEvent } from '@testing-library/react'
const refresh = vi.hoisted(() => vi.fn())
vi.mock('next/navigation', () => ({useRouter: () => ({refresh})}))
import { CartProvider } from '@/components/cart/cart-context'
import type { Cart } from '@/lib/shopify/types'
const linked: Cart = {
 id: 'old', checkoutUrl: 'https://example.test/checkout', totalQuantity: 0,
 buyerIdentity: { customer: { id: 'member', email: 'member@example.test', displayName: 'Test member' } },
 lines: [], cost: {
  subtotalAmount: { amount: '0', currencyCode: 'AED' },
  totalAmount: { amount: '0', currencyCode: 'AED' },
 },
}
beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal('fetch', vi.fn()) })
afterEach(() => { cleanup(); vi.unstubAllGlobals() })
it('refreshes server-rendered pricing after expired cart replacement', async () => {
 vi.mocked(fetch).mockImplementation(async () => new Response(JSON.stringify({success:true,cart:{id:'guest'}})))
 render(<CartProvider initialCart={linked}>Cart</CartProvider>)
 await waitFor(()=>expect(refresh).toHaveBeenCalledTimes(1))
})
it('keeps a valid member cart and checks again when returning to the window', async () => {
 vi.mocked(fetch).mockImplementation(async () => new Response(JSON.stringify({success:true,cart:{id:'old'}})))
 render(<CartProvider initialCart={linked}>Cart</CartProvider>)
 await waitFor(()=>expect(fetch).toHaveBeenCalledTimes(1))
 expect(refresh).not.toHaveBeenCalled()
 fireEvent.focus(window)
 await waitFor(()=>expect(fetch).toHaveBeenCalledTimes(2))
})
it('does not recreate ordinary guest carts', () => {
 render(<CartProvider initialCart={{...linked,buyerIdentity:undefined}}>Cart</CartProvider>)
 expect(fetch).not.toHaveBeenCalled()
})
