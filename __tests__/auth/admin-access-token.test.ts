// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.useRealTimers(); vi.resetModules(); });
function configure() {
  vi.stubEnv('SHOPIFY_STORE_DOMAIN', 'test.myshopify.com');
  vi.stubEnv('SHOPIFY_ADMIN_CLIENT_ID', 'test-client');
  vi.stubEnv('SHOPIFY_ADMIN_CLIENT_SECRET', 'test-secret');
}
it('rejects a legacy token when ATP-owned credentials are missing', async () => {
  vi.stubEnv('SHOPIFY_ADMIN_CLIENT_ID', ''); vi.stubEnv('SHOPIFY_ADMIN_CLIENT_SECRET', '');
  vi.stubEnv('SHOPIFY_ADMIN_ACCESS_TOKEN', 'test-legacy');
  const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
  await expect((await import('@/lib/shopify/admin-access-token')).getAdminAccessToken()).rejects.toThrow('incomplete');
  expect(fetch).not.toHaveBeenCalled();
});
it('shares concurrent requests and renews before the token expires', async () => {
  configure(); vi.useFakeTimers(); vi.setSystemTime(new Date('2026-09-20T00:00:00Z'));
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ access_token: 'test-new', expires_in: 86400 }) });
  vi.stubGlobal('fetch', fetch);
  const { getAdminAccessToken } = await import('@/lib/shopify/admin-access-token');
  expect(await Promise.all([getAdminAccessToken(), getAdminAccessToken()])).toEqual(['test-new','test-new']);
  expect(fetch).toHaveBeenCalledTimes(1);
  await getAdminAccessToken(); expect(fetch).toHaveBeenCalledTimes(1);
  vi.setSystemTime(new Date('2026-09-20T23:59:01Z'));
  await getAdminAccessToken(); expect(fetch).toHaveBeenCalledTimes(2);
  expect(fetch.mock.calls[0][1].redirect).toBe('error');
});
it('rejects incomplete migration and untrusted domain without sending credentials', async () => {
  configure(); vi.stubEnv('SHOPIFY_ADMIN_CLIENT_SECRET', ''); vi.stubEnv('SHOPIFY_ADMIN_ACCESS_TOKEN', 'test-legacy');
  const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
  const { getAdminAccessToken } = await import('@/lib/shopify/admin-access-token');
  await expect(getAdminAccessToken()).rejects.toThrow('incomplete');
  vi.stubEnv('SHOPIFY_ADMIN_CLIENT_SECRET', 'test-secret'); vi.stubEnv('SHOPIFY_STORE_DOMAIN', 'test.myshopify.com.evil.invalid');
  await expect(getAdminAccessToken()).rejects.toThrow('Invalid Shopify store');
  expect(fetch).not.toHaveBeenCalled();
});
it('does not cache a failed response or leak its body, and allows retry', async () => {
  configure();
  const fetch = vi.fn().mockResolvedValueOnce({ ok: false, json: async () => ({ secret: 'test-sensitive' }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: 'test-retry', expires_in: 86400 }) });
  vi.stubGlobal('fetch', fetch);
  const { getAdminAccessToken } = await import('@/lib/shopify/admin-access-token');
  await expect(getAdminAccessToken()).rejects.toThrow('Shopify Admin token request failed');
  expect(await getAdminAccessToken()).toBe('test-retry');
});
