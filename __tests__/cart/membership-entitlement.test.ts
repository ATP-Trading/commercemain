import { expect, it } from 'vitest'
import { resolveMembershipEntitlement as resolve } from '@/lib/shopify/membership-entitlement'
const subscription = { id: 1, status: 'active', variantIds: [46301020094702] }
it('does not make ordinary customer accounts members', () => expect(resolve([], null)).toBeNull())
it('recognizes a merchant grant without a paid order', () => expect(resolve(['atp-member'], null)?.source).toBe('merchant'))
it('recognizes a grant with an empty subscription list', () => expect(resolve(['atp-member'], '[]')?.source).toBe('merchant'))
it('removes the granted entitlement when the merchant tag is removed', () => expect(resolve([], '[]')).toBeNull())
it('recognizes active Appstle membership independently of the grant tag', () => expect(resolve([], JSON.stringify([subscription]))?.source).toBe('appstle'))
it.each(['cancelled','expired','paused','pending'])('does not revive a %s subscription from a stale tag', status => {
 expect(resolve(['atp-member'], JSON.stringify([{...subscription,status}]))).toBeNull()
})
it.each(['invalid','{}','[null]'])('reports invalid membership data instead of granting benefits: %s', value => {
 expect(() => resolve(['atp-member'],value)).toThrow()
})
it('does not accept marketing or approximate membership tags', () => expect(resolve(['subscriber','atp-member-pending'], null)).toBeNull())
it('returns only verified subscription dates, without treating renewal as expiry', () => {
 const result = resolve([], JSON.stringify([{...subscription, membershipStartDate:'2026-09-14T13:57:24Z', nextBillingDate:'2027-09-14T13:00:00Z', privateToken:'hidden'}]))
 expect(result).toMatchObject({startedAt:'2026-09-14T13:57:24.000Z', nextBillingDate:'2027-09-14T13:00:00.000Z'})
 expect(result).not.toHaveProperty('privateToken')
 expect(result).not.toHaveProperty('expirationDate')
})
it('does not invent dates for grants or malformed Appstle dates', () => {
 expect(resolve(['atp-member'], null)).not.toHaveProperty('nextBillingDate')
 expect(resolve([], JSON.stringify([{...subscription, nextBillingDate:'invalid'}]))?.nextBillingDate).toBeUndefined()
})
