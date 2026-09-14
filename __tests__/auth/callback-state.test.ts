import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/auth/callback/route'
import { getOAuthState, exchangeCodeForTokens, storeTokens } from '@/lib/shopify/customer-account-oauth'

vi.mock('@/lib/shopify/customer-account-oauth', () => ({
  getConfig: () => ({ siteUrl: 'https://store.example' }),
  getOAuthState: vi.fn(), clearOAuthState: vi.fn(),
  exchangeCodeForTokens: vi.fn(), storeTokens: vi.fn()
}))
vi.mock('@/lib/shopify/server', () => ({ updateCartBuyerIdentity: vi.fn(async () => ({ userErrors: [] })) }))
const encoded = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url')
async function callback(state?: string) {
  const url = new URL('https://store.example/api/auth/callback?code=test-code')
  if (state !== undefined) url.searchParams.set('state', state)
  return GET(new NextRequest(url))
}
beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getOAuthState).mockResolvedValue({ state: 'expected-token', codeVerifier: 'verifier', nonce: 'nonce' })
  vi.mocked(exchangeCodeForTokens).mockResolvedValue({ access_token: 'test-token' } as any)
})
describe('OAuth callback state validation', () => {
  it.each([undefined, '', 'wrong-token', encoded({ returnTo: '/ar/account' }), encoded({ csrf: '' }), encoded({ csrf: 'wrong-token' }), encoded(null)])('rejects invalid state %s before exchanging tokens', async state => {
    const response = await callback(state)
    expect(response.headers.get('location')).toBe('https://store.example/login?error=invalid_state')
    expect(exchangeCodeForTokens).not.toHaveBeenCalled()
    expect(storeTokens).not.toHaveBeenCalled()
  })
  it('rejects a missing stored state', async () => {
    vi.mocked(getOAuthState).mockResolvedValue({ codeVerifier: 'verifier' } as any)
    await callback(encoded({ csrf: 'expected-token' }))
    expect(exchangeCodeForTokens).not.toHaveBeenCalled()
  })
  it('accepts matching plain state', async () => {
    const response = await callback('expected-token')
    expect(exchangeCodeForTokens).toHaveBeenCalledExactlyOnceWith('test-code', 'verifier')
    expect(response.headers.get('location')).toBe('https://store.example/account')
  })
  it('accepts matching encoded state and a localized return path', async () => {
    const response = await callback(encoded({ csrf: 'expected-token', returnTo: '/ar/account/orders' }))
    expect(response.headers.get('location')).toBe('https://store.example/ar/account/orders')
    expect(storeTokens).toHaveBeenCalledTimes(1)
  })
  it('never redirects a valid login to an external destination', async () => {
    const response = await callback(encoded({ csrf: 'expected-token', returnTo: '//outside.example' }))
    expect(response.headers.get('location')).toBe('https://store.example/account')
  })
})
