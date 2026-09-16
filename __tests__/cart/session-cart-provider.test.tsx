import React from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { render, waitFor, cleanup, fireEvent } from '@testing-library/react'
const refresh = vi.hoisted(() => vi.fn())
vi.mock('next/navigation', () => ({useRouter: () => ({refresh})}))
vi.mock('@/hooks/use-membership-cart', () => ({useMembershipCart: vi.fn()}))
import { CartProvider } from '@/components/cart/cart-context'
const linked = {id:'old',buyerIdentity:{customer:{id:'member'}},lines:[]} as any
beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal('fetch', vi.fn()) })
afterEach(() => { cleanup(); vi.unstubAllGlobals() })
it('refreshes server-rendered pricing after expired cart replacement', async () => {
 vi.mocked(fetch).mockResolvedValue({ok:true,json:async()=>({success:true,cart:{id:'guest'}})} as any)
 render(<CartProvider initialCart={linked}>Cart</CartProvider>)
 await waitFor(()=>expect(refresh).toHaveBeenCalledTimes(1))
})
it('keeps a valid member cart and checks again when returning to the window', async () => {
 vi.mocked(fetch).mockResolvedValue({ok:true,json:async()=>({success:true,cart:{id:'old'}})} as any)
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
