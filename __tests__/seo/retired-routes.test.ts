import { expect, it, vi } from 'vitest'
const navigation = vi.hoisted(() => ({ redirect: vi.fn((url: string) => { throw new Error(url) }), permanentRedirect: vi.fn((url: string) => { throw new Error(url) }) }))
vi.mock('next/navigation', () => navigation)
import Membership from '@/app/[locale]/membership/page'
import Signup from '@/app/[locale]/membership/signup/page'
import Renewal from '@/app/[locale]/membership/renew/page'
import { GET as lifecycleGet, POST as lifecyclePost } from '@/app/api/admin/membership/lifecycle/route'
import { GET as analyticsGet, POST as analyticsPost } from '@/app/api/membership/analytics/route'
import { GET as debug } from '@/app/api/debug-shopify/route'
import { GET as paymentTest } from '@/app/api/test-payment-methods/route'
import { POST as proxy } from '@/app/api/shopify/customer/route'
it.each([lifecycleGet,lifecyclePost,analyticsGet,analyticsPost,debug,paymentTest,proxy])('retired internal endpoints never execute unauthenticated operations', async handler => {
 expect((await handler()).status).toBe(404)
})
it.each(['ar','en'])('sends old membership purchase pages to the real product in %s', async locale => {
 await expect(Membership({ params: Promise.resolve({ locale }) })).rejects.toThrow(`/${locale}/product/atp-membership`)
 await expect(Signup({ params: Promise.resolve({ locale }) })).rejects.toThrow(`/${locale}/product/atp-membership`)
 await expect(Renewal({ params: Promise.resolve({ locale }) })).rejects.toThrow(`/${locale}/account/membership`)
})
