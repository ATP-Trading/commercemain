import {handleShopifyVisitRequest} from '@/lib/analytics/shopify-visit-proxy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function handle(request: Request) {
  return handleShopifyVisitRequest(request, {
    domain: process.env.SHOPIFY_STORE_DOMAIN || '',
    token: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '',
    origin: 'https://www.atpgroupservices.ae',
  });
}
export const POST = handle;
export const DELETE = handle;
