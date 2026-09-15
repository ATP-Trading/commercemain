// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('next-intl/server', () => ({ getLocale: async () => 'en' }));
vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => ({ value: 'cart' }), set: vi.fn() }), headers: async () => new Headers() }));
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); vi.resetModules(); });
for (const action of ['add', 'update']) it(`rejects excess ${action} on the server before a mutation`, async () => {
 vi.stubEnv('SHOPIFY_STORE_DOMAIN', 'test.myshopify.com'); vi.stubEnv('SHOPIFY_STOREFRONT_ACCESS_TOKEN', 'test-only');
 vi.spyOn(console, 'log').mockImplementation(() => {});
 const requests: string[] = [];
 vi.stubGlobal('fetch', vi.fn(async (_url, options) => {
  const { query } = JSON.parse(options.body); requests.push(query);
  const cart = { id: 'cart', lines: { edges: [{ node: { id: 'line', quantity: 3, merchandise: { id: 'variant', product: { id: 'p', handle: 'p', title: 'P' } }, cost: { totalAmount: { amount: '30', currencyCode: 'AED' } } } }] }, cost: { totalAmount: { amount: '30', currencyCode: 'AED' } } };
  const data = query.includes('VariantStock') ? { node: { availableForSale: true, quantityAvailable: 5 } } : { cart };
  return { ok: true, status: 200, headers: new Headers({'content-type':'application/json'}), json: async () => ({ data }) };
 }));
 const server = await import('@/lib/shopify/server');
 const result = action === 'add' ? server.addToCart([{ merchandiseId: 'variant', quantity: 3 }]) : server.updateCart([{ id: 'line', merchandiseId: 'variant', quantity: 6 }]);
 await expect(result).rejects.toThrow('STOCK_LIMIT');
 expect(requests.some(query => query.includes('mutation'))).toBe(false);
});
