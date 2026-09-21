// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({ adminToken: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('next-intl/server', () => ({ getLocale: async () => 'en' }));
vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => ({ value: 'cart' }), set: vi.fn() }), headers: async () => new Headers() }));
// Keep the actual stock query and stock-limit checks; replace only credentials.
vi.mock('@/lib/shopify/admin-access-token', () => ({ getAdminAccessToken: auth.adminToken }));

beforeEach(() => {
  vi.clearAllMocks();
  auth.adminToken.mockResolvedValue('isolated-admin-token');
  vi.stubEnv('SHOPIFY_STORE_DOMAIN', 'test.myshopify.com');
  vi.stubEnv('SHOPIFY_STOREFRONT_ACCESS_TOKEN', 'test-only');
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.resetModules();
});

for (const action of ['add', 'update'] as const) {
  it(`rejects excess ${action} on the server before a mutation`, async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const requests: string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (_url, options) => {
      const { query, variables } = JSON.parse(options.body);
      requests.push(query);
      const cart = {
        id: 'cart',
        lines: { edges: [{ node: { id: 'line', quantity: 3, merchandise: { id: 'variant', product: { id: 'p', handle: 'p', title: 'P' } }, cost: { totalAmount: { amount: '30', currencyCode: 'AED' } } } }] },
        cost: { totalAmount: { amount: '30', currencyCode: 'AED' } },
      };
      let data: unknown;
      if (query.includes('OnlineStock')) {
        expect(variables.id).toBe('variant');
        expect(new Headers(options.headers).get('X-Shopify-Access-Token')).toBe('isolated-admin-token');
        data = { productVariant: { availableForSale: true, sellableOnlineQuantity: 5, inventoryPolicy: 'DENY', inventoryItem: { tracked: true } } };
      } else if (query.includes('query getCart')) {
        data = { cart };
      } else {
        throw new Error(`Unexpected mocked GraphQL operation: ${query}`);
      }
      return new Response(JSON.stringify({ data }), { headers: { 'content-type': 'application/json' } });
    }));
    const server = await import('@/lib/shopify/server');
    const result = action === 'add'
      ? server.addToCart([{ merchandiseId: 'variant', quantity: 3 }])
      : server.updateCart([{ id: 'line', merchandiseId: 'variant', quantity: 6 }]);
    await expect(result).rejects.toThrow('STOCK_LIMIT');
    expect(auth.adminToken).toHaveBeenCalledTimes(1);
    expect(requests.filter(query => query.includes('OnlineStock'))).toHaveLength(1);
    expect(requests.some(query => query.includes('mutation'))).toBe(false);
  });
}
