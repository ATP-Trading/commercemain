// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ locale: 'ar' }));
vi.mock('server-only', () => ({}));
vi.mock('next-intl/server', () => ({ getLocale: async () => state.locale }));
vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => ({ value: 'test-cart' }), set: vi.fn() }), headers: async () => new Headers() }));
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); vi.resetModules(); });
describe('cart request language', () => {
 for (const locale of ['ar', 'en']) {
  it(`requests cart translations for ${locale}`, async () => {
   state.locale = locale;
   vi.stubEnv('SHOPIFY_STORE_DOMAIN', 'test.myshopify.com');
   vi.stubEnv('SHOPIFY_STOREFRONT_ACCESS_TOKEN', 'test-only');
   vi.spyOn(console, 'log').mockImplementation(() => {});
   const fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, headers: new Headers({ 'content-type': 'application/json' }), json: async () => ({ data: { cart: null } }) });
   vi.stubGlobal('fetch', fetch);
   const { getCart } = await import('@/lib/shopify/server');
   await getCart();
   const request = JSON.parse(fetch.mock.calls[0]![1].body);
   expect(request.variables).toEqual({ cartId: 'test-cart', language: locale.toUpperCase() });
  });
 }
});
import { localizeCheckoutUrl } from '@/lib/cart/checkout-locale';
it('preserves checkout session details when replacing the language', () => {
 const original = 'https://checkout.atpgroupservices.ae/cart/c/test?key=test-key&locale=en&discount=TEST';
 const url = new URL(localizeCheckoutUrl(original, 'ar'));
 expect(url.pathname).toBe('/cart/c/test');
 expect(url.hostname).toBe('checkout.atpgroupservices.ae');
 expect(url.searchParams.get('key')).toBe('test-key');
 expect(url.searchParams.get('discount')).toBe('TEST');
 expect(url.searchParams.getAll('locale')).toEqual(['ar']);
 expect(new URL(localizeCheckoutUrl(url.toString(), 'en')).searchParams.get('locale')).toBe('en');
});
