import 'server-only';
import type { Stock } from './inventory-limit';
import { getAdminAccessToken } from './admin-access-token';
export const onlineStockQuery = `query OnlineStock($id: ID!) { productVariant(id: $id) { availableForSale sellableOnlineQuantity inventoryPolicy inventoryItem { tracked } } }`;
export async function getOnlineStock(id: string): Promise<Stock> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  if (!domain) throw new Error('STOCK_UNAVAILABLE');
  const token = await getAdminAccessToken();
  const response = await fetch(`https://${domain}/admin/api/${process.env.SHOPIFY_API_VERSION || '2026-01'}/graphql.json`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query: onlineStockQuery, variables: { id } }), cache: 'no-store', signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('STOCK_UNAVAILABLE');
  const result = await response.json();
  const variant = result.data?.productVariant;
  if (result.errors?.length || !variant) throw new Error('STOCK_UNAVAILABLE');
  const unlimited = !variant.inventoryItem.tracked || variant.inventoryPolicy === 'CONTINUE';
  return { availableForSale: variant.availableForSale, quantityAvailable: unlimited ? null : Math.max(0, variant.sellableOnlineQuantity), currentlyNotInStock: unlimited };
}
