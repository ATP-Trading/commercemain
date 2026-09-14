import { expect, it, vi } from 'vitest'
import { prepareMembershipLines, ATP_MEMBERSHIP_VARIANT as id } from '@/lib/shopify/membership-purchase'
const line = { merchandiseId: id, quantity: 1 }
const variant = { product: { requiresSellingPlan: true }, sellingPlanAllocations: { nodes: [{ sellingPlan: { id: 'gid://shopify/SellingPlan/123', name: 'Annual' } }] } }
it('attaches the plan allocated by Shopify to membership lines in a mixed cart', async () => {
 const regular = { merchandiseId: 'other', quantity: 2 }
 expect(await prepareMembershipLines([regular, line], async () => variant)).toEqual([regular, { ...line, sellingPlanId: 'gid://shopify/SellingPlan/123' }])
})
it('does not fetch plans for ordinary purchases', async () => {
 const lookup = vi.fn()
 expect(await prepareMembershipLines([{merchandiseId:'other', quantity:1}],lookup)).toEqual([{merchandiseId:'other',quantity:1}])
 expect(lookup).not.toHaveBeenCalled()
})
it.each([null, {...variant,sellingPlanAllocations:{nodes:[]}}, {...variant,sellingPlanAllocations:{nodes:[...variant.sellingPlanAllocations.nodes,...variant.sellingPlanAllocations.nodes]}}])('fails safely when the membership plan is missing or ambiguous', async value => {
 await expect(prepareMembershipLines([line],async()=>value)).rejects.toThrow()
})
it('does not trust a supplied plan in place of the allocated plan',async()=>{
 expect((await prepareMembershipLines([{...line,sellingPlanId:'wrong'}],async()=>variant))[0]?.sellingPlanId).toBe('gid://shopify/SellingPlan/123')
})
