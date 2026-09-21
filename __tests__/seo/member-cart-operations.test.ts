// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ add: vi.fn(), remove: vi.fn(), update: vi.fn(), get: vi.fn(), invalidate: vi.fn() }));
vi.mock('@/lib/shopify/server', () => ({
  addToCart: mocks.add, removeFromCart: mocks.remove, updateCart: mocks.update, getCart: mocks.get,
  createCart: vi.fn(), getCollectionProducts: vi.fn(), updateCartBuyerIdentity: vi.fn(),
}));
vi.mock('next/cache', () => ({ updateTag: mocks.invalidate }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('next-intl/server', () => ({ getLocale: async () => 'ar' }));
vi.mock('@/lib/shopify/customer-account-oauth', () => ({ getValidAccessToken: vi.fn() }));
import { addToCartOptimistic, removeFromCartOptimistic, updateCartQuantityOptimistic } from '@/components/cart/actions';

beforeEach(() => {
  for (const mock of Object.values(mocks)) mock.mockReset();
  mocks.add.mockResolvedValue(undefined);
  mocks.remove.mockResolvedValue(undefined);
  mocks.update.mockResolvedValue(undefined);
  mocks.get.mockResolvedValue({ lines: [{ id: 'line', merchandise: { id: 'variant' } }] });
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

function expectNoWrites() {
  expect(mocks.add).not.toHaveBeenCalled();
  expect(mocks.remove).not.toHaveBeenCalled();
  expect(mocks.update).not.toHaveBeenCalled();
}

for (const customer of [undefined, 'customer']) {
  describe(`one current cart mutation per action with ${customer || 'guest'} argument`, () => {
    it('adds the requested quantity exactly once', async () => {
      expect(await addToCartOptimistic('variant', 2, customer)).toEqual({ success: true });
      expect(mocks.add).toHaveBeenCalledExactlyOnceWith([{ merchandiseId: 'variant', quantity: 2 }]);
      expect(mocks.remove).not.toHaveBeenCalled();
      expect(mocks.update).not.toHaveBeenCalled();
    });
    it('removes exactly once', async () => {
      expect(await removeFromCartOptimistic('line', customer)).toEqual({ success: true });
      expect(mocks.remove).toHaveBeenCalledExactlyOnceWith(['line']);
      expect(mocks.add).not.toHaveBeenCalled();
      expect(mocks.update).not.toHaveBeenCalled();
    });
    it('updates once using the resolved line instead of a stale optimistic id', async () => {
      expect(await updateCartQuantityOptimistic('stale-line', 3, customer, 'variant')).toEqual({ success: true });
      expect(mocks.update).toHaveBeenCalledExactlyOnceWith([{ id: 'line', merchandiseId: 'variant', quantity: 3 }]);
      expect(mocks.remove).not.toHaveBeenCalled();
      expect(mocks.add).not.toHaveBeenCalled();
    });
    it('removes zero quantity exactly once', async () => {
      expect(await updateCartQuantityOptimistic('line', 0, customer)).toEqual({ success: true });
      expect(mocks.remove).toHaveBeenCalledExactlyOnceWith(['line']);
      expect(mocks.update).not.toHaveBeenCalled();
      expect(mocks.add).not.toHaveBeenCalled();
    });
    it('reports actual add rejection without retrying or claiming success', async () => {
      mocks.add.mockRejectedValueOnce(new Error('Shopify unavailable'));
      expect(await addToCartOptimistic('variant', 1, customer)).toEqual({ success: false, error: 'Failed to add item to cart' });
      expect(mocks.add).toHaveBeenCalledExactlyOnceWith([{ merchandiseId: 'variant', quantity: 1 }]);
      expect(mocks.remove).not.toHaveBeenCalled();
      expect(mocks.update).not.toHaveBeenCalled();
    });
    it('reports actual remove rejection without retrying', async () => {
      mocks.remove.mockRejectedValueOnce(new Error('Shopify unavailable'));
      expect(await removeFromCartOptimistic('line', customer)).toEqual({ success: false, error: 'Failed to remove item from cart' });
      expect(mocks.remove).toHaveBeenCalledExactlyOnceWith(['line']);
      expect(mocks.add).not.toHaveBeenCalled();
      expect(mocks.update).not.toHaveBeenCalled();
    });
    it('reports actual quantity-update rejection without fallback writes', async () => {
      mocks.update.mockRejectedValueOnce(new Error('Shopify unavailable'));
      expect(await updateCartQuantityOptimistic('line', 3, customer)).toEqual({ success: false, error: 'Failed to update cart quantity' });
      expect(mocks.update).toHaveBeenCalledTimes(1);
      expect(mocks.remove).not.toHaveBeenCalled();
      expect(mocks.add).not.toHaveBeenCalled();
    });
    it('reports failed zero-quantity removal without attempting an update', async () => {
      mocks.remove.mockRejectedValueOnce(new Error('Shopify unavailable'));
      expect(await updateCartQuantityOptimistic('line', 0, customer)).toEqual({ success: false, error: 'Failed to update cart quantity' });
      expect(mocks.remove).toHaveBeenCalledTimes(1);
      expect(mocks.update).not.toHaveBeenCalled();
      expect(mocks.add).not.toHaveBeenCalled();
    });
    it('does not mutate a missing cart', async () => {
      mocks.get.mockResolvedValueOnce(undefined);
      expect(await updateCartQuantityOptimistic('line', 3, customer)).toEqual({ success: false, error: 'No cart found' });
      expectNoWrites();
    });
    it('does not mutate a cart when the requested line is missing', async () => {
      expect(await updateCartQuantityOptimistic('missing', 3, customer, 'missing-variant')).toEqual({ success: false, error: 'Item not found in cart' });
      expectNoWrites();
    });
    it('does not mutate malformed line data', async () => {
      mocks.get.mockResolvedValueOnce({ lines: [{ id: 'line', merchandise: { id: '' } }] });
      expect(await updateCartQuantityOptimistic('line', 3, customer)).toEqual({ success: false, error: 'Invalid cart item data' });
      expectNoWrites();
    });
    it('does not mutate after a cart-read failure', async () => {
      mocks.get.mockRejectedValueOnce(new Error('Read unavailable'));
      expect(await updateCartQuantityOptimistic('line', 3, customer)).toEqual({ success: false, error: 'Failed to update cart quantity' });
      expectNoWrites();
    });
  });
}
