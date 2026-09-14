import { beforeEach, expect, it, vi } from 'vitest'
const auth = vi.hoisted(() => ({ loggedIn: vi.fn(), token: vi.fn(), query: vi.fn(), clear: vi.fn() }))
vi.mock('@/lib/shopify/customer-account-oauth', () => ({ isLoggedIn: auth.loggedIn, getValidAccessToken: auth.token, queryCustomerAccountApi: auth.query, clearTokens: auth.clear }))
import { GET } from '@/app/api/auth/status/route'
beforeEach(() => { vi.resetAllMocks(); auth.loggedIn.mockResolvedValue(true); auth.token.mockResolvedValue('customer-token') })
it('does not destroy the login session during an upstream outage', async () => {
 auth.query.mockRejectedValue(new Error('Temporary outage'))
 expect((await GET()).status).toBe(502)
 expect(auth.clear).not.toHaveBeenCalled()
})
it('does not disguise GraphQL errors as successful logout', async () => {
 auth.query.mockResolvedValue({ errors: [{ message: 'Temporarily unavailable' }] })
 expect((await GET()).status).toBe(502)
 expect(auth.clear).not.toHaveBeenCalled()
})
it('returns the saved profile without caching it', async () => {
 auth.query.mockResolvedValue({ data: { customer: { id: 'one', firstName: 'Saud', emailAddress: { emailAddress: 'test@example.com' } } } })
 const response = await GET()
 expect((await response.json()).customer.firstName).toBe('Saud')
 expect(response.headers.get('Cache-Control')).toBe('private, no-store')
})
it('still reports a missing session as logged out', async () => {
 auth.loggedIn.mockResolvedValue(false)
 expect((await (await GET()).json()).isLoggedIn).toBe(false)
 expect(auth.query).not.toHaveBeenCalled()
})

it('clears a session only when Shopify explicitly rejects its authorization', async () => {
 auth.query.mockRejectedValue(Object.assign(new Error('Unauthorized'), { status: 401 }))
 const response = await GET()
 expect((await response.json()).isLoggedIn).toBe(false)
 expect(auth.clear).toHaveBeenCalledOnce()
})
