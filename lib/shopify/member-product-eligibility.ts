import type { Product } from './types'
// Keep in sync with Appstle product-discount offer 12914. Membership in these
// collections is read from Shopify; missing data never promises a discount.
const discountedCollections = new Set([
  'gid://shopify/Collection/447125127406',
  'gid://shopify/Collection/445778591982',
  'gid://shopify/Collection/445735895278',
  'gid://shopify/Collection/444046082286',
])
export function isMemberDiscountEligible(product: Pick<Product, 'handle' | 'collections'>) {
  return product.handle !== 'atp-membership' && Boolean(product.collections?.edges.some(({ node }) => node.id && discountedCollections.has(node.id)))
}
