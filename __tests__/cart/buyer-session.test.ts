// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest'
const session = vi.hoisted(() => ({ token: null as string | null, cartId: 'cart' as string | undefined }))
vi.mock('server-only', () => ({}))
vi.mock('next-intl/server', () => ({ getLocale: async () => 'en' }))
vi.mock('@/lib/shopify/customer-account-oauth', () => ({ getValidAccessToken: async () => session.token }))
vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => session.cartId ? { value: session.cartId } : undefined }), headers: async () => new Headers() }))
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); vi.resetModules(); session.cartId = 'cart' })

for (const token of [null, 'current-member-token']) it(`reprices a retained cart for ${token ? 'the current member' : 'a guest after expiry'}`, async () => {
  session.token = token
  vi.stubEnv('SHOPIFY_STORE_DOMAIN', 'test.myshopify.com')
  vi.stubEnv('SHOPIFY_STOREFRONT_ACCESS_TOKEN', 'test-only')
  vi.spyOn(console, 'log').mockImplementation(() => {})
  const amount = token ? '157.25' : '185.00'
  const fetchMock = vi.fn(async (_url, options) => {
    const request = JSON.parse(options.body)
    expect(request.variables.buyerIdentity).toEqual({ countryCode: 'AE', customerAccessToken: token })
    return { ok: true, status: 200, headers: new Headers({'content-type':'application/json'}), json: async () => ({ data: { cartBuyerIdentityUpdate: { cart: { id:'cart', lines:{edges:[{node:{id:'line',quantity:1,merchandise:{id:'variant',product:{id:'product',handle:'click-plus',title:'CLICK PLUS'}},cost:{totalAmount:{amount,currencyCode:'AED'}}}}]}, totalQuantity:1, cost:{totalAmount:{amount,currencyCode:'AED'}} }, userErrors:[] } } }) }
  })
  vi.stubGlobal('fetch', fetchMock)
  const { syncCartBuyerSession } = await import('@/lib/shopify/server')
  expect((await syncCartBuyerSession())?.cost.totalAmount.amount).toBe(amount)
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

it('does not present stale pricing when identity refresh is rejected', async () => {
  session.token = null
  vi.stubEnv('SHOPIFY_STORE_DOMAIN', 'test.myshopify.com')
  vi.stubEnv('SHOPIFY_STOREFRONT_ACCESS_TOKEN', 'test-only')
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok:true, status:200, headers:new Headers({'content-type':'application/json'}), json:async()=>({data:{cartBuyerIdentityUpdate:{cart:null,userErrors:[{message:'Rejected'}]}}}) })))
  const { syncCartBuyerSession } = await import('@/lib/shopify/server')
  await expect(syncCartBuyerSession()).rejects.toThrow('Unable to refresh cart pricing')
})
