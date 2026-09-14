import { NextResponse } from 'next/server'
import { getValidAccessToken, queryCustomerAccountApi } from '@/lib/shopify/customer-account-oauth'
import { config } from '@/lib/config'
import { resolveMembershipEntitlement } from '@/lib/shopify/membership-entitlement'

const noMembership = { isMember: false, tier: null, discountRate: 0, membership: null }
const headers = { 'Cache-Control': 'private, no-store' }

export async function GET() {
  try {
    const accessToken = await getValidAccessToken()
    if (!accessToken) return NextResponse.json(noMembership, { headers })

    // Resolve the customer from the authenticated session, never a caller-supplied ID.
    const identity = await queryCustomerAccountApi<{ customer: { id: string } }>(
      accessToken, 'query MembershipIdentity { customer { id } }'
    )
    if (identity.errors?.length || !identity.data?.customer?.id) {
      return NextResponse.json({ ...noMembership, error: 'Unable to verify customer' }, { status: 401, headers })
    }
    const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
    if (!adminToken || !config.shopify.domain) throw new Error('Membership lookup is not configured')
    const response = await fetch(`https://${config.shopify.domain}/admin/api/${config.shopify.apiVersion}/graphql.json`, {
      method: 'POST', cache: 'no-store',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': adminToken },
      body: JSON.stringify({
        query: 'query MembershipStatus($id: ID!) { customer(id: $id) { tags metafield(namespace: "appstle_membership", key: "subscriptions") { value } } }',
        variables: { id: identity.data.customer.id },
      }),
    })
    if (!response.ok) throw new Error('Membership lookup failed')
    const result = await response.json()
    if (result.errors?.length) throw new Error('Membership lookup failed')
    if (!result.data?.customer) throw new Error('Customer lookup failed')
    const subscription = resolveMembershipEntitlement(result.data.customer.tags, result.data.customer.metafield?.value)
    if (!subscription) return NextResponse.json(noMembership, { headers })
    return NextResponse.json({
      isMember: true, tier: 'atp', discountRate: 0.15,
      // No invented expiry: Appstle owns subscriptions; merchant grants last until the tag is removed.
      membership: subscription,
    }, { headers })
  } catch {
    return NextResponse.json({ ...noMembership, error: 'Unable to load membership status' }, { status: 503, headers })
  }
}
export const dynamic = 'force-dynamic'
