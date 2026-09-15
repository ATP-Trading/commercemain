export type Stock = { availableForSale?: boolean; quantityAvailable?: number | null; currentlyNotInStock?: boolean };
export function stockLimit(stock?: Stock): number | undefined {
  if (stock?.availableForSale === false) return 0;
  if (stock?.availableForSale && stock.quantityAvailable === 0) return undefined;
  if (stock?.currentlyNotInStock || stock?.quantityAvailable == null) return undefined;
  return Math.max(0, stock.quantityAvailable);
}
export function remainingStock(stock: Stock | undefined, inCart: number): number | undefined {
  const limit = stockLimit(stock);
  return limit === undefined ? undefined : Math.max(0, limit - inCart);
}
export function assertStockQuantity(stock: Stock, quantity: number) {
  const limit = stockLimit(stock);
  if (!Number.isSafeInteger(quantity) || quantity < 0 || (limit !== undefined && quantity > limit)) {
    throw new Error('STOCK_LIMIT');
  }
}
export const variantStockQuery = `query VariantStock($id: ID!) { node(id: $id) { ... on ProductVariant { availableForSale quantityAvailable currentlyNotInStock } } }`;
