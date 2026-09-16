// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
const mock = vi.hoisted(() => ({
  cartId: 'cart' as string | undefined,
  remove: vi.fn(), update: vi.fn(), clear: vi.fn(),
}))
vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => mock.cartId ? {value: mock.cartId} : undefined, delete: mock.remove }) }))
vi.mock('@/lib/shopify/server', () => ({ updateCartBuyerIdentity: mock.update }))
vi.mock('@/lib/shopify/customer-account-oauth', () => ({
  getTokens: async () => ({}), clearTokens: mock.clear,
  getConfig: () => ({ siteUrl: 'https://example.com' }), buildLogoutUrl: vi.fn(),
}))
import { GET, POST } from '@/app/api/auth/logout/route'
beforeEach(() => {
  vi.clearAllMocks(); mock.cartId = 'cart'
  mock.update.mockResolvedValue({ cart: { buyerIdentity: {customer: null} }, userErrors: [] })
})
it('detaches the buyer while retaining the cart and signs out', async () => {
  const response = await POST(new NextRequest('https://example.com/api/auth/logout?returnTo=/en/cart', {method:'POST'}))
  expect(mock.update).toHaveBeenCalledWith({customerAccessToken:null,email:null,phone:null})
  expect(mock.remove).not.toHaveBeenCalled()
  expect(mock.clear).toHaveBeenCalled()
  expect(response.headers.get('location')).toBe('https://example.com/en/cart')
})
it.each(['error', 'linked', 'missing', 'network'])('forgets the browser cart safely after %s', async (failure) => {
  if(failure === 'network') mock.update.mockRejectedValue(new Error('unavailable'))
  else mock.update.mockResolvedValue({cart: failure === 'missing' ? null : {buyerIdentity:{customer: failure === 'linked' ? {id:'customer'} : null}},userErrors: failure === 'error' ? [{message:'failed'}] : []})
  await GET(new NextRequest('https://example.com/api/auth/logout'))
  expect(mock.remove).toHaveBeenCalledWith('cartId')
  expect(mock.clear).toHaveBeenCalled()
})
it('does not call Shopify without a cart', async () => {
  mock.cartId = undefined
  await GET(new NextRequest('https://example.com/api/auth/logout'))
  expect(mock.update).not.toHaveBeenCalled()
  expect(mock.clear).toHaveBeenCalled()
})
