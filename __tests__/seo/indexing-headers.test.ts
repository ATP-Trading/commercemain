// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { unstable_getResponseFromNextConfig } from 'next/experimental/testing/server';
import { indexingHeaders } from '@/lib/indexing-headers';
vi.mock('@/lib/utils', () => ({ baseUrl: 'https://www.atpgroupservices.ae' }));
import robots from '@/app/robots';
const responseFor = (path: string) => unstable_getResponseFromNextConfig({
  url: `https://www.atpgroupservices.ae${path}`, nextConfig: { headers: async () => indexingHeaders },
});
describe('page indexing headers', () => {
  it.each(['/account', '/en/account', '/ar/account/orders', '/ar/auth/login', '/en/admin/membership',
    '/en/cart', '/ar/checkout/membership/123', '/login', '/ar/signup', '/en/debug-product/a.b',
    '/ar/test-arabic-product', '/debug-collections', '/en/membership/signup', '/ar/membership/renew',
    '/en/search?q=cream', '/ar/search?sort=price-asc', '/search?q=test'])('excludes %s', async path => {
    expect((await responseFor(path)).headers.get('X-Robots-Tag')).toBe('noindex, follow');
  });
  it.each(['/en', '/ar/contact', '/en/search', '/ar/collections/skincare', '/en/product/account-cream',
    '/en/atp-membership', '/en/accounting', '/ar/benefits/skin-health'])('keeps %s eligible', async path => {
    expect((await responseFor(path)).headers.get('X-Robots-Tag')).toBeNull();
  });
  it('allows noindex pages and rendering assets to be crawled with one shared rule', () => {
    expect(robots().rules).toEqual({ userAgent: '*', allow: '/', disallow: ['/api/', '/trpc/'] });
    expect(robots().sitemap).toBe('https://www.atpgroupservices.ae/sitemap.xml');
  });
});
