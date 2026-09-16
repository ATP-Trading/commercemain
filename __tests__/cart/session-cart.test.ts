// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'
import type { Cart } from '@/lib/shopify/types'
const create = vi.hoisted(() => vi.fn())
vi.mock('@/lib/shopify/server', () => ({ createCart: create }))
import { cartForSession } from '@/lib/cart/session-cart'
const stale = { id: 'old', checkoutUrl: 'old-checkout', buyerIdentity: { customer: { id: 'previous' } }, lines: [{quantity:2, merchandise:{id:'variant'}, sellingPlanAllocation:{sellingPlan:{id:'plan'}}}] } as unknown as Cart
beforeEach(() => { vi.resetAllMocks() })
it('replaces a customer cart after session expiry, retaining purchase lines only', async () => {
  const guest = { id:'guest', checkoutUrl:'guest-checkout' }
  create.mockResolvedValue(guest)
  expect(await cartForSession(stale, null)).toBe(guest)
  expect(create).toHaveBeenCalledWith([{merchandiseId:'variant',quantity:2,sellingPlanId:'plan'}])
})
it('leaves a valid session cart intact', async () => {
  expect(await cartForSession(stale, 'valid')).toBe(stale)
  expect(create).not.toHaveBeenCalled()
})
it('leaves a guest cart intact', async () => {
  const guest = {...stale, buyerIdentity:undefined}
  expect(await cartForSession(guest, null)).toBe(guest)
  expect(create).not.toHaveBeenCalled()
})
it('never returns the previous checkout if guest creation fails', async () => {
  create.mockRejectedValue(new Error('unavailable'))
  await expect(cartForSession(stale, null)).rejects.toThrow('unavailable')
})
