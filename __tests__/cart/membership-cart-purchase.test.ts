// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  cartId: undefined as string | undefined,
  set: vi.fn(),
  adminToken: vi.fn(),
}));
vi.mock('server-only', () => ({}));
vi.mock('next-intl/server', () => ({ getLocale: async () => 'ar' }));
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => state.cartId ? { value: state.cartId } : undefined, set: state.set }),
  headers: async () => new Headers(),
}));
// Mock the credential boundary, not stock validation or selling-plan selection.
// The real token provider has its own regression tests; these tests need no secrets.
vi.mock('@/lib/shopify/admin-access-token', () => ({ getAdminAccessToken: state.adminToken }));

beforeEach(() => {
  vi.clearAllMocks();
  state.adminToken.mockResolvedValue('isolated-admin-token');
  vi.stubEnv('SHOPIFY_STORE_DOMAIN', 'test.myshopify.com');
  vi.stubEnv('SHOPIFY_STOREFRONT_ACCESS_TOKEN', 'test-only');
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.resetModules();
  state.cartId = undefined;
});

for (const existing of [false, true]) {
  it(`sends the allocated plan when ${existing ? 'adding to' : 'creating'} a cart`, async () => {
    state.cartId = existing ? 'existing-cart' : undefined;
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const requests: Array<{ query: string; variables: Record<string, any> }> = [];
    const cart = {
      id: 'saved-cart', checkoutUrl: 'https://example.com/checkout', totalQuantity: 1,
      lines: { edges: [{ node: {
        id: 'line', quantity: 1,
        merchandise: { id: 'gid://shopify/ProductVariant/46301020094702', product: { id: 'membership', handle: 'atp-membership', title: 'Membership' } },
        cost: { totalAmount: { amount: '99', currencyCode: 'AED' } },
      } }] },
      cost: { totalAmount: { amount: '99', currencyCode: 'AED' }, subtotalAmount: { amount: '99', currencyCode: 'AED' } },
    };
    vi.stubGlobal('fetch', vi.fn(async (_url, options) => {
      const request = JSON.parse(options.body);
      requests.push(request);
      let data: unknown;
      if (request.query.includes('query OnlineStock')) {
        expect(new Headers(options.headers).get('X-Shopify-Access-Token')).toBe('isolated-admin-token');
        data = { productVariant: { availableForSale: true, sellableOnlineQuantity: -4, inventoryPolicy: 'CONTINUE', inventoryItem: { tracked: true } } };
      } else if (request.query.includes('query getCart')) {
        data = { cart: { ...cart, lines: { edges: [] } } };
      } else if (request.query.includes('query VariantPlan')) {
        data = { node: { product: { requiresSellingPlan: true }, sellingPlanAllocations: { nodes: [{ sellingPlan: { id: 'gid://shopify/SellingPlan/123', name: 'Annual' } }] } } };
      } else if (request.query.includes(existing ? 'mutation cartLinesAdd' : 'mutation cartCreate')) {
        data = existing ? { cartLinesAdd: { cart, userErrors: [] } } : { cartCreate: { cart, userErrors: [] } };
      } else {
        throw new Error(`Unexpected mocked GraphQL operation: ${request.query}`);
      }
      return new Response(JSON.stringify({ data }), { headers: { 'content-type': 'application/json' } });
    }));

    const { addToCart } = await import('@/lib/shopify/server');
    await addToCart([{ merchandiseId: 'gid://shopify/ProductVariant/46301020094702', quantity: 1 }]);
    const expected = [{ merchandiseId: 'gid://shopify/ProductVariant/46301020094702', quantity: 1, sellingPlanId: 'gid://shopify/SellingPlan/123' }];
    const mutations = requests.filter(request => request.query.includes(existing ? 'mutation cartLinesAdd' : 'mutation cartCreate'));
    expect(mutations).toHaveLength(1);
    const mutation = mutations[0]!;
    expect(existing ? mutation.variables.lines : mutation.variables.input.lines).toEqual(expected);
    expect(mutation.variables.language).toBe('AR');
    expect(state.adminToken).toHaveBeenCalledTimes(1);
    if (!existing) expect(state.set).toHaveBeenCalledWith('cartId', 'saved-cart');
  });
}
