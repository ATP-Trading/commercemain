import {handleShopifyVisitRequest} from '@/lib/analytics/shopify-visit-proxy';

// POST/DELETE are not cacheable. The handler also sets private no-store responses.
// Use Next.js's default Node runtime without incompatible segment overrides.
function handle(request: Request) {
  return handleShopifyVisitRequest(request, {
    domain: process.env.SHOPIFY_STORE_DOMAIN || '',
    token: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '',
    origin: 'https://www.atpgroupservices.ae',
  });
}
export const POST = handle;
export const DELETE = handle;
