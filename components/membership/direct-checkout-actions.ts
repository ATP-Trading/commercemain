'use server'

import { getLocale } from 'next-intl/server'
import { getValidAccessToken, queryCustomerAccountApi } from '@/lib/shopify/customer-account-oauth'
import { shopifyFetch } from '@/lib/shopify/server'
import { ATP_MEMBERSHIP_VARIANT, prepareMembershipLines, variantPlanQuery, type VariantPlans } from '@/lib/shopify/membership-purchase'
import { localizeCheckoutUrl } from '@/lib/cart/checkout-locale'

const mutation = `mutation MembershipCheckout($input: CartInput!) {
  cartCreate(input: $input) {
    userErrors { message }
    cart { checkoutUrl buyerIdentity { email customer { id } } lines(first: 2) { nodes { quantity merchandise { ... on ProductVariant { id } } sellingPlanAllocation { sellingPlan { id } } } } }
  }
}`

export async function startMembershipCheckout(): Promise<{ url?: string; login?: string; error?: boolean }> {
  const locale = (await getLocale()) === 'ar' ? 'ar' : 'en'
  const token = await getValidAccessToken()
  if (!token) return { login: `/api/auth/login?returnTo=${encodeURIComponent(`/${locale}/product/atp-membership`)}` }
  try {
    const identity = await queryCustomerAccountApi<{ customer: { id: string; emailAddress: { emailAddress: string } | null } }>(token,
      'query MembershipBuyer { customer { id emailAddress { emailAddress } } }')
    const customer = identity.data?.customer
    const email = customer?.emailAddress?.emailAddress
    if (identity.errors?.length || !customer?.id || !email) throw new Error('Identity unavailable')
    const lines = await prepareMembershipLines([{ merchandiseId: ATP_MEMBERSHIP_VARIANT, quantity: 1 }], async id => {
      const result = await shopifyFetch<{ data: { node: VariantPlans | null }; variables: { id: string } }>({ query: variantPlanQuery, variables: { id } })
      return result.body.data.node
    })
    // A separate checkout: never read, replace or clear the customer's regular cart cookie.
    const result = await shopifyFetch<{ data: { cartCreate: { userErrors: { message: string }[]; cart: { checkoutUrl: string; buyerIdentity: { email: string; customer: { id: string } | null }; lines: { nodes: { quantity: number; merchandise: { id: string }; sellingPlanAllocation: { sellingPlan: { id: string } } | null }[] } } | null } }; variables: { input: unknown } }>({
      query: mutation, variables: { input: { lines, buyerIdentity: { customerAccessToken: token, email } } },
    })
    const created = result.body.data.cartCreate
    const cart = created?.cart
    const line = cart?.lines.nodes[0]
    // Membership checkout must never silently fall back to an unrelated guest identity.
    if (created?.userErrors.length || !cart || cart.buyerIdentity.customer?.id !== customer.id || cart.buyerIdentity.email?.toLowerCase() !== email.toLowerCase() || cart.lines.nodes.length !== 1 || line?.quantity !== 1 || line.merchandise.id !== ATP_MEMBERSHIP_VARIANT || line.sellingPlanAllocation?.sellingPlan.id !== lines[0]?.sellingPlanId) throw new Error('Checkout verification failed')
    const url = new URL(cart.checkoutUrl)
    const host = process.env.SHOPIFY_CHECKOUT_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN
    if (host) url.host = host
    url.protocol = 'https:'
    return { url: localizeCheckoutUrl(url.toString(), locale) }
  } catch {
    return { error: true }
  }
}
