import { afterEach, describe, expect, it, vi } from 'vitest';
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); vi.resetModules(); });
describe('Shopify environment configuration', () => {
  it('does not supply a built-in token or demo domain when settings are absent', async () => {
    vi.resetModules();
    vi.stubEnv('SHOPIFY_STORE_DOMAIN', '');
    vi.stubEnv('SHOPIFY_STOREFRONT_ACCESS_TOKEN', '');
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { config, validateEnvironmentVariables } = await import('@/lib/config');
    expect(config.shopify.accessToken).toBe('');
    expect(config.shopify.domain).toBe('');
    expect(validateEnvironmentVariables()).toBe(false);
  });
  it('uses the supplied environment configuration', async () => {
    vi.resetModules();
    vi.stubEnv('SHOPIFY_STORE_DOMAIN', 'test-store.myshopify.com');
    vi.stubEnv('SHOPIFY_STOREFRONT_ACCESS_TOKEN', 'test-placeholder-not-a-real-token');
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const { config, validateEnvironmentVariables } = await import('@/lib/config');
    expect(config.shopify.accessToken).toBe('test-placeholder-not-a-real-token');
    expect(config.shopify.domain).toBe('test-store.myshopify.com');
    expect(validateEnvironmentVariables()).toBe(true);
  });
});
