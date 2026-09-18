// @vitest-environment node
import { expect, it } from 'vitest';
import { unstable_getResponseFromNextConfig } from 'next/experimental/testing/server';
import { legacyRedirects } from '@/lib/legacy-redirects';
const redirect = (path: string) => unstable_getResponseFromNextConfig({ url: `https://www.atpgroupservices.ae${path}`, nextConfig: { redirects: async () => legacyRedirects } });
it.each([
  ['/ar/products/giena-sensitive-feminine-wash', '/ar/product/giena-sensitive-feminine-wash'],
  ['/en/products/click-plus-women-s-wellness-supplement', '/en/product/click-plus-women-s-wellness-supplement'],
  ['/products/coffee?utm_source=google', '/en/product/coffee?utm_source=google'],
  ['/ar/products/a.b', '/ar/product/a.b'],
  ['/ar/collections/all', '/ar/search'],
  ['/collections/all', '/en/search'],
  ['/en/collections/skincare/products/cream', '/en/product/cream'],
])('permanently redirects %s without dropping tracking', async (source, target) => {
  const result = await redirect(source);
  expect(result.status).toBe(308);
  expect(result.headers.get('location')).toBe(`https://www.atpgroupservices.ae${target}`);
});
it('does not redirect current products or collections', async () => {
  for (const path of ['/ar/product/cream','/en/collections/featured-products','/api/products']) {
    expect((await redirect(path)).headers.get('location')).toBeNull();
  }
});
