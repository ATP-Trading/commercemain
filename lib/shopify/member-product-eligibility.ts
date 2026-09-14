import type { Product } from './types'
// Keep in sync with Appstle product-discount offer 12914. Membership in these
// collections is read from Shopify; missing data never promises a discount.
const discountedCollections = new Set([
  'gid://shopify/Collection/447125127406',
  'gid://shopify/Collection/445778591982',
  'gid://shopify/Collection/445735895278',
  'gid://shopify/Collection/444046082286',
])
export const WATER_SOIL_COLLECTION_ID = 'gid://shopify/Collection/455154499822'
export function getMemberDiscountRate(product: Pick<Product, 'handle' | 'collections'>): number {
  if (product.handle === 'atp-membership') return 0
  const ids = product.collections?.edges.map(({ node }) => node.id) ?? []
  // The category-specific rate takes precedence if merchandising collections overlap.
  if (ids.includes(WATER_SOIL_COLLECTION_ID)) return 0.10
  return ids.some(id => id && discountedCollections.has(id)) ? 0.15 : 0
}
export function isMemberDiscountEligible(product: Pick<Product, 'handle' | 'collections'>) {
  return getMemberDiscountRate(product) > 0
}
