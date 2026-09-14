import { expect, it } from 'vitest'
import { isMemberDiscountEligible as eligible } from '@/lib/shopify/member-product-eligibility'
const collections={edges:[{node:{id:'gid://shopify/Collection/447125127406',handle:'wellness',title:'Wellness'}}]}
it('recognizes an eligible collection even when it is not first',()=>expect(eligible({handle:'coffee',collections:{edges:[{node:{id:'other',handle:'all',title:'All'}},...collections.edges]}})).toBe(true))
it('does not discount water products outside eligible collections',()=>expect(eligible({handle:'alkamag',collections:{edges:[{node:{id:'other',handle:'water',title:'Water'}}]}})).toBe(false))
it('does not promise discounts when collection data is absent',()=>expect(eligible({handle:'coffee'})).toBe(false))
it('does not discount the membership purchase itself',()=>expect(eligible({handle:'atp-membership',collections})).toBe(false))
