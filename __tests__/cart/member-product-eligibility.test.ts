import { expect, it } from 'vitest'
import { isMemberDiscountEligible as eligible } from '@/lib/shopify/member-product-eligibility'
const collections={edges:[{node:{id:'gid://shopify/Collection/447125127406',handle:'wellness',title:'Wellness'}}]}
it('recognizes an eligible collection even when it is not first',()=>expect(eligible({handle:'coffee',collections:{edges:[{node:{id:'other',handle:'all',title:'All'}},...collections.edges]}})).toBe(true))
it('does not discount water products outside eligible collections',()=>expect(eligible({handle:'alkamag',collections:{edges:[{node:{id:'other',handle:'water',title:'Water'}}]}})).toBe(false))
it('does not promise discounts when collection data is absent',()=>expect(eligible({handle:'coffee'})).toBe(false))
it('does not discount the membership purchase itself',()=>expect(eligible({handle:'atp-membership',collections})).toBe(false))

import { getMemberDiscountRate, WATER_SOIL_COLLECTION_ID } from '@/lib/shopify/member-product-eligibility'
const water = {node:{id:WATER_SOIL_COLLECTION_ID,handle:'water-soil-technology-solutions',title:'Water & Soil'}}
it('applies 10% to water and soil products',()=>expect(getMemberDiscountRate({handle:'alkamag',collections:{edges:[water]}})).toBe(0.10))
it('keeps the water rate at 10% when merchandising collections overlap',()=>expect(getMemberDiscountRate({handle:'soil',collections:{edges:[...collections.edges,water]}})).toBe(0.10))
it('preserves 15% for other eligible products',()=>expect(getMemberDiscountRate({handle:'coffee',collections})).toBe(0.15))
it('never discounts membership even in the water collection',()=>expect(getMemberDiscountRate({handle:'atp-membership',collections:{edges:[water]}})).toBe(0))
