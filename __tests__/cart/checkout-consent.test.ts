// @vitest-environment node
import {afterEach, expect, it, vi} from 'vitest';
import {normalizeCheckoutConsent} from '@/lib/cart/checkout-consent';
vi.mock('server-only', () => ({}));
vi.mock('next-intl/server', () => ({getLocale: async () => 'en'}));
vi.mock('next/headers', () => ({cookies: async () => ({get: vi.fn()}), headers: async () => new Headers({
  cookie: 'customerAccessToken=private; cartId=private; _shopify_analytics=provider; _ga=google-private',
})}));
afterEach(() => {vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); vi.resetModules();});
it('does not grant consent from truthy strings or arbitrary client input', () => {
  expect(normalizeCheckoutConsent({analytics: 'true', marketing: true, saleOfData: true})).toEqual({
    analytics: null, marketing: false, preferences: false, saleOfData: false,
  });
});
it.each([true, false, null])('carries consent %s to Shopify without leaking customer or Google cookies', async analytics => {
  vi.stubEnv('SHOPIFY_STORE_DOMAIN', 'test.myshopify.com');
  vi.stubEnv('SHOPIFY_STOREFRONT_ACCESS_TOKEN', 'test-only');
  vi.spyOn(console, 'log').mockImplementation(() => {});
  const fetcher = vi.fn(async () => new Response(JSON.stringify({data: {cart: {
    checkoutUrl: 'https://test.myshopify.com/checkouts/example?privacy=opaque',
  }}}), {headers: {'content-type': 'application/json'}}));
  vi.stubGlobal('fetch', fetcher);
  const {getConsentedCheckoutUrl} = await import('@/lib/shopify/server');
  expect(await getConsentedCheckoutUrl('session-validated-cart', normalizeCheckoutConsent({analytics}))).toContain('privacy=opaque');
  const options = (fetcher.mock.calls[0] as unknown as [string, RequestInit])[1];
  expect(JSON.parse(String(options.body)).variables).toMatchObject({cartId: 'session-validated-cart', consent: {analytics}});
  const cookie = new Headers(options.headers).get('cookie');
  expect(cookie).toBe(analytics ? '_shopify_analytics=provider' : null);
  expect(JSON.stringify(options)).not.toContain('private');
});
