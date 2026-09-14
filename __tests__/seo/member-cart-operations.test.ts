// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ add: vi.fn(), remove: vi.fn(), update: vi.fn(), get: vi.fn(), memberError: false }));
vi.mock('@/lib/shopify/server', () => ({ addToCart: mocks.add, removeFromCart: mocks.remove, updateCart: mocks.update, getCart: mocks.get, createCart: vi.fn(), getCollectionProducts: vi.fn(), updateCartBuyerIdentity: vi.fn() }));
vi.mock('next/cache', () => ({ updateTag: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('next-intl/server', () => ({ getLocale: async () => 'ar' }));
vi.mock('@/lib/shopify/customer-account-oauth', () => ({ getValidAccessToken: vi.fn() }));
vi.mock('@/components/cart/membership-cart-actions', () => ({
 addToCartWithMembership: async (id: string, quantity: number) => {
  if (mocks.memberError) return { success: false, error: 'Unavailable' };
  await mocks.add([{ merchandiseId: id, quantity }]); return { success: true };
 },
 removeFromCartWithMembership: async (id: string) => { await mocks.remove([id]); return { success: true }; },
 updateCartQuantityWithMembership: async (id: string, merchandiseId: string, quantity: number) => {
  if (quantity === 0) await mocks.remove([id]);
  else await mocks.update([{ id, merchandiseId, quantity }]);
  return { success: true };
 }
}));
import { addToCartOptimistic, removeFromCartOptimistic, updateCartQuantityOptimistic } from '@/components/cart/actions';
beforeEach(() => { vi.clearAllMocks(); mocks.memberError = false; mocks.get.mockResolvedValue({ lines: [{ id: 'line', merchandise: { id: 'variant' } }] }); });
describe('one cart mutation per customer action', () => {
 for (const customer of [undefined, 'customer']) {
  it(`adds the requested quantity exactly once for ${customer || 'guest'}`, async () => {
   expect(await addToCartOptimistic('variant', 2, customer)).toEqual({ success: true });
   expect(mocks.add).toHaveBeenCalledTimes(1);
   expect(mocks.add).toHaveBeenCalledWith([{ merchandiseId: 'variant', quantity: 2 }]);
  });
  it(`removes exactly once for ${customer || 'guest'}`, async () => {
   await removeFromCartOptimistic('line', customer); expect(mocks.remove).toHaveBeenCalledTimes(1);
  });
  it(`updates exactly once using the resolved line for ${customer || 'guest'}`, async () => {
   await updateCartQuantityOptimistic('stale-line', 3, customer, 'variant');
   expect(mocks.update).toHaveBeenCalledTimes(1);
   expect(mocks.update).toHaveBeenCalledWith([{ id: 'line', merchandiseId: 'variant', quantity: 3 }]);
  });
  it(`removes zero quantity exactly once for ${customer || 'guest'}`, async () => {
   await updateCartQuantityOptimistic('line', 0, customer); expect(mocks.remove).toHaveBeenCalledTimes(1); expect(mocks.update).not.toHaveBeenCalled();
  });
 }
 it('propagates membership action failures without reporting success or adding again', async () => {
  mocks.memberError = true;
  expect(await addToCartOptimistic('variant', 1, 'customer')).toEqual({ success: false, error: 'Unavailable' });
  expect(mocks.add).not.toHaveBeenCalled();
 });
});
