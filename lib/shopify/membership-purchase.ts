export const ATP_MEMBERSHIP_VARIANT = 'gid://shopify/ProductVariant/46301020094702'
export type PurchaseLine = { merchandiseId: string; quantity: number; sellingPlanId?: string }
export type VariantPlans = { product: { requiresSellingPlan: boolean }; sellingPlanAllocations: { nodes: { sellingPlan: { id: string; name: string } }[] } }
export const variantPlanQuery = `query VariantPlan($id: ID!) { node(id: $id) { ... on ProductVariant { product { requiresSellingPlan } sellingPlanAllocations(first: 2) { nodes { sellingPlan { id name } } } } } }`
export async function prepareMembershipLines(lines: PurchaseLine[], lookup: (id: string) => Promise<VariantPlans | null>) {
  if (!lines.some(line => line.merchandiseId === ATP_MEMBERSHIP_VARIANT)) return lines
  const variant = await lookup(ATP_MEMBERSHIP_VARIANT)
  const plans = variant?.sellingPlanAllocations.nodes ?? []
  if (!variant?.product.requiresSellingPlan || plans.length !== 1 || !plans[0]?.sellingPlan.id) {
    throw new Error('Membership purchase plan is unavailable or ambiguous')
  }
  return lines.map(line => line.merchandiseId === ATP_MEMBERSHIP_VARIANT
    ? { ...line, sellingPlanId: plans[0]!.sellingPlan.id } : line)
}
