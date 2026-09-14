// Shopify returns this translated handle in Arabic menus but requires the
// original handle when fetching the collection through the Storefront API.
export function canonicalCollectionHandle(handle: string): string {
 let decoded = handle
 try { decoded = decodeURIComponent(handle) } catch { /* Preserve malformed input for normal route handling. */ }
 return decoded === 'حلول-تكنولوجيا-المياه-والتربة' ? 'water-soil-technology-solutions' : decoded
}
