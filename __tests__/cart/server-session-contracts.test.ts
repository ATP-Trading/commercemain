// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CartUserError, CartWarning, ShopifyCart } from '@/lib/shopify/types';

const boundary = vi.hoisted(() => ({
  cartId: undefined as string | undefined,
  locale: 'en',
  set: vi.fn(),
  stock: vi.fn(),
}));
vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => name === 'cartId' && boundary.cartId !== undefined
      ? { value: boundary.cartId } : undefined,
    set: boundary.set,
  }),
  headers: async () => new Headers(),
}));
vi.mock('next-intl/server', () => ({ getLocale: async () => boundary.locale }));
vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }));
vi.mock('@/lib/config', () => ({
  validateEnvironmentVariables: () => true,
  config: { shopify: { domain: 'example.myshopify.com', apiVersion: '2026-01', accessToken: 'test-only-token' } },
}));
vi.mock('@/lib/shopify/stock-server', () => ({ getOnlineStock: boundary.stock }));
import {
  removeFromCart, updateCart, updateCartWithWarnings, removeFromCartWithWarnings,
  updateCartDiscountCodes, updateCartNote, updateCartAttributes, createCart,
  createCartWithWarnings, addToCartWithWarnings, shopifyFetch,
} from '@/lib/shopify/server';

const cartId = 'gid://shopify/Cart/test-only';
const lines = [{ id: 'line-1', merchandiseId: 'variant-1', quantity: 2 }];
const attributes = [{ key: 'gift', value: 'yes' }];
function cart(quantity = 2): ShopifyCart {
  return {
    id: cartId, checkoutUrl: 'https://example.test/checkout', totalQuantity: quantity,
    // Preserve Shopify's discounted total instead of recomputing it from line cost.
    cost: { subtotalAmount: { amount: '40', currencyCode: 'AED' }, totalAmount: { amount: '34', currencyCode: 'AED' } },
    lines: { edges: [{ node: {
      id: 'line-1', quantity,
      cost: { totalAmount: { amount: '40', currencyCode: 'AED' } },
      sellingPlanAllocation: { sellingPlan: { id: 'plan-1' } },
      attributes,
      merchandise: {
        id: 'variant-1', title: 'Default', selectedOptions: [],
        product: { id: 'product-1', handle: 'sample', title: 'Sample',
          featuredImage: { url: 'https://example.test/image.png', altText: 'Sample', width: 100, height: 100 } },
      },
    } }] },
  };
}
const operations = [
  { name: 'remove', run: () => removeFromCart(['line-1']), key: 'cartLinesRemove', variables: { lineIds: ['line-1'] }, localized: true },
  { name: 'update', run: () => updateCart(lines), key: 'cartLinesUpdate', variables: { lines }, localized: true },
  { name: 'update with warnings', run: () => updateCartWithWarnings(lines), key: 'cartLinesUpdate', variables: { lines }, localized: false },
  { name: 'remove with warnings', run: () => removeFromCartWithWarnings(['line-1']), key: 'cartLinesRemove', variables: { lineIds: ['line-1'] }, localized: false },
  { name: 'discount', run: () => updateCartDiscountCodes(['TEST-ONLY']), key: 'cartDiscountCodesUpdate', variables: { discountCodes: ['TEST-ONLY'] }, localized: false },
  { name: 'note', run: () => updateCartNote('Test note'), key: 'cartNoteUpdate', variables: { note: 'Test note' }, localized: false },
  { name: 'attributes', run: () => updateCartAttributes(attributes), key: 'cartAttributesUpdate', variables: { attributes }, localized: false },
];
const fetchMock = vi.fn<typeof fetch>();
function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), { status: 200, headers: { 'content-type': 'application/json' } });
}
function requests() {
  return fetchMock.mock.calls.map(([, init]) => {
    if (typeof init?.body !== 'string') throw new Error('Expected a JSON request body');
    return JSON.parse(init.body) as { query: string; variables?: Record<string, unknown> };
  });
}
beforeEach(() => {
  boundary.cartId = cartId;
  boundary.locale = 'en';
  boundary.set.mockReset();
  boundary.stock.mockReset().mockResolvedValue({ quantityAvailable: 20, availableForSale: true });
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

for (const operation of operations) {
  describe(operation.name, () => {
    it.each([undefined, ''])('does not request or recreate a missing session cart (%s)', async missing => {
      boundary.cartId = missing;
      await expect(operation.run()).rejects.toThrow('No cart found');
      expect(fetchMock).not.toHaveBeenCalled();
      expect(boundary.stock).not.toHaveBeenCalled();
      expect(boundary.set).not.toHaveBeenCalled();
    });
    it.each(['en', 'ar'])('preserves one mutation and existing payload/total in %s', async locale => {
      boundary.locale = locale;
      fetchMock.mockImplementation(async (_input, init) => {
        if (typeof init?.body !== 'string') throw new Error('Missing request body');
        const { query } = JSON.parse(init.body) as { query: string };
        return query.includes('query getCart(')
          ? jsonResponse({ data: { cart: cart(1) } })
          : jsonResponse({ data: { [operation.key]: { cart: cart(), userErrors: [], warnings: [] } } });
      });
      const result = await operation.run();
      const mutations = requests().filter(request => request.query.includes('mutation '));
      expect(mutations).toHaveLength(1);
      expect(mutations[0]?.variables).toEqual({ cartId, ...operation.variables,
        ...(operation.localized ? { language: locale === 'ar' ? 'AR' : 'EN' } : {}) });
      expect(fetchMock).toHaveBeenCalledTimes(operation.name === 'update' ? 2 : 1);
      const returnedCart = 'cart' in result ? result.cart : result;
      expect(returnedCart?.cost.totalAmount).toEqual({ amount: '34', currencyCode: 'AED' });
      expect(returnedCart?.lines[0]?.sellingPlanAllocation).toEqual({ sellingPlan: { id: 'plan-1' } });
      expect(returnedCart?.lines[0]?.attributes).toEqual(attributes);
      expect(boundary.set).not.toHaveBeenCalled();
    });
  });
}

it('passes cart warnings and user errors through without inventing success', async () => {
  const warnings: CartWarning[] = [{ code: 'MERCHANDISE_NOT_ENOUGH_STOCK', message: 'Limited stock', target: 'line-1' }];
  const userErrors: CartUserError[] = [{ field: ['discountCodes'], message: 'Unavailable code' }];
  fetchMock.mockResolvedValueOnce(jsonResponse({ data: { cartDiscountCodesUpdate: { cart: null, warnings, userErrors } } }));
  expect(await updateCartDiscountCodes(['TEST-ONLY'])).toEqual({ cart: null, warnings, userErrors });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(boundary.set).not.toHaveBeenCalled();
});

it('preserves explicit empty-cart creation and localized variables', async () => {
  boundary.cartId = undefined;
  boundary.locale = 'ar';
  fetchMock.mockResolvedValueOnce(jsonResponse({ data: { cartCreate: { cart: { ...cart(), totalQuantity: 0, lines: { edges: [] } }, userErrors: [] } } }));
  expect((await createCart()).id).toBe(cartId);
  expect(requests()[0]?.variables).toEqual({ input: { lines: [] }, language: 'AR' });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(boundary.set).toHaveBeenCalledExactlyOnceWith('cartId', cartId);
});

it('preserves create-with-warnings lineItems and intentional add-when-missing behavior', async () => {
  boundary.cartId = undefined;
  fetchMock.mockImplementation(async () => jsonResponse({ data: { cartCreate: { cart: cart(), userErrors: [], warnings: [] } } }));
  await addToCartWithWarnings([{ merchandiseId: 'variant-1', quantity: 2 }]);
  expect(requests()[0]?.variables).toEqual({ lineItems: [{ merchandiseId: 'variant-1', quantity: 2 }] });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(boundary.set).toHaveBeenCalledExactlyOnceWith('cartId', cartId);
});

it('keeps undefined variables for an explicit empty warnings cart', async () => {
  fetchMock.mockResolvedValueOnce(jsonResponse({ data: { cartCreate: { cart: cart(), userErrors: [], warnings: [] } } }));
  await createCartWithWarnings();
  expect(requests()[0]?.variables).toBeUndefined();
});

it.each([null, undefined, 'transport stopped', { message: 17 }, { message: 'GraphQL failure', extensions: { code: 'TEST' } }])(
  'retains a non-Error rejection without replacing it with a logging TypeError (%j)', async failure => {
    fetchMock.mockRejectedValueOnce(failure);
    await expect(shopifyFetch({ query: 'query Test { shop { name } }' })).rejects.toEqual({ error: failure, query: 'query Test { shop { name } }' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  },
);
it('preserves ordinary Error classification, status, cause and message', async () => {
  const failure = Object.assign(new Error('Transport failed', { cause: new Error('Cause') }), { status: 502 });
  fetchMock.mockRejectedValueOnce(failure);
  await expect(shopifyFetch({ query: 'query Test { shop { name } }' })).rejects.toEqual({
    cause: 'Error: Cause', status: 502, message: 'Transport failed', query: 'query Test { shop { name } }',
  });
});
