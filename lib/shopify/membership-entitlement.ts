import { getActiveAtpSubscription } from './appstle-membership'
const atpVariant = '46301020094702'
/** Server-owned data only. A customer login is never evidence of membership. */
export function resolveMembershipEntitlement(tags: unknown, value: string | null | undefined) {
 const active = getActiveAtpSubscription(value)
 if (active) return {
  id: String(active.id), status: 'active' as const, source: 'appstle' as const,
  merchantGranted: Array.isArray(tags) && tags.includes('atp-member-granted'),
  startedAt: validDate(active.membershipStartDate),
  nextBillingDate: validDate(active.nextBillingDate),
 }
 // Explicit merchant grants remain valid independently of paid subscription cancellation.
 if (Array.isArray(tags) && tags.includes('atp-member-granted')) return {
  id: 'merchant-grant', status: 'active' as const, source: 'merchant' as const,
 }
 if (value) {
  let subscriptions: unknown
  try { subscriptions = JSON.parse(value) } catch { throw new Error('Invalid membership data') }
  if (!Array.isArray(subscriptions) || subscriptions.some(item => !item || typeof item !== 'object' || !Array.isArray(item.variantIds))) throw new Error('Invalid membership data')
  // A stale customer tag must not revive a known cancelled/expired ATP subscription.
  if (subscriptions.some(item => item.variantIds.some((id: unknown) => String(id) === atpVariant))) return null
 }
 return Array.isArray(tags) && tags.includes('atp-member')
  ? { id: 'merchant-grant', status: 'active' as const, source: 'merchant' as const }
  : null
}

function validDate(value: unknown): string | undefined {
 return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : undefined
}
