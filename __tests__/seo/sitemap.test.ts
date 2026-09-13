import { beforeEach, describe, expect, it, vi } from 'vitest';
const { shopifyFetch } = vi.hoisted(() => ({ shopifyFetch: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('@/lib/shopify/server', () => ({ shopifyFetch }));
vi.mock('@/lib/utils', () => ({ baseUrl: 'https://www.atpgroupservices.ae', validateEnvironmentVariables: vi.fn() }));
import sitemap from '@/app/sitemap';
import { getSitemapResources } from '@/lib/shopify/sitemap';

const item = (id: string, handle = id) => ({ id, handle, title: handle, tags: [], updatedAt: '2026-01-10T00:00:00Z' });
const page = (kind: string, nodes: ReturnType<typeof item>[], hasNextPage = false, endCursor: string | null = null) =>
  ({ body: { data: { [kind]: { nodes, pageInfo: { hasNextPage, endCursor } } } } });
beforeEach(() => { shopifyFetch.mockReset(); });
describe('complete sitemap catalog', () => {
  it.each(['products', 'collections'] as const)('paginates %s beyond 100 and deduplicates IDs', async kind => {
    const first = Array.from({ length: 250 }, (_, i) => item(String(i)));
    shopifyFetch.mockResolvedValueOnce(page(kind, first, true, 'cursor1'))
      .mockResolvedValueOnce(page(kind, [item('249'), item('250')]));
    expect(await getSitemapResources(kind, 'AR')).toHaveLength(251);
    expect(shopifyFetch.mock.calls[1][0].variables).toEqual({ language: 'AR', after: 'cursor1' });
  });
  it('rejects a later-page failure instead of returning a partial catalog', async () => {
    shopifyFetch.mockResolvedValueOnce(page('products', [item('1')], true, 'cursor1')).mockRejectedValueOnce(new Error('offline'));
    await expect(getSitemapResources('products', 'EN')).rejects.toThrow('offline');
  });
  it('rejects a repeated pagination cursor', async () => {
    shopifyFetch.mockResolvedValue(page('products', [item('1')], true, 'same'));
    await expect(getSitemapResources('products', 'EN')).rejects.toThrow('did not advance');
    expect(shopifyFetch).toHaveBeenCalledTimes(2);
  });
  it('rejects malformed data rather than treating it as an empty store', async () => {
    shopifyFetch.mockResolvedValue({ body: { data: {} } });
    await expect(getSitemapResources('products', 'EN')).rejects.toThrow('Invalid sitemap');
  });
  it('uses localized handles and dates, with only public implemented routes', async () => {
    shopifyFetch.mockImplementation(async ({ query, variables }) => {
      const kind = query.includes('SitemapProducts') ? 'products' : 'collections';
      const handle = variables.language === 'AR' ? 'عناية' : 'skincare';
      const hidden = { ...item('hidden-product'), tags: ['nextjs-frontend-hidden'] };
      return page(kind, [item('1', handle), item('2', 'ems-training'), kind === 'products' ? hidden : item('3', 'hidden-private')]);
    });
    const routes = await sitemap();
    const urls = routes.map(route => route.url);
    expect(urls).toContain('https://www.atpgroupservices.ae/ar/product/%D8%B9%D9%86%D8%A7%D9%8A%D8%A9');
    expect(urls).toContain('https://www.atpgroupservices.ae/en/collections/skincare');
    expect(urls).toContain('https://www.atpgroupservices.ae/ar/policies/privacy-policy');
    expect(urls.every(url => /^https:\/\/www.atpgroupservices.ae\/(en|ar)(\/|$)/.test(url))).toBe(true);
    expect(urls.some(url => /ems|hidden|riyadh|doha|account|debug|\/search/.test(url))).toBe(false);
    expect(routes.find(route => route.url.endsWith('/en'))).not.toHaveProperty('lastModified');
    expect(routes.find(route => route.url.endsWith('/en/product/skincare'))?.lastModified).toBe('2026-01-10T00:00:00Z');
    expect(new Set(urls).size).toBe(urls.length);
    expect(shopifyFetch).toHaveBeenCalledTimes(4);
  });
  it('fails the whole sitemap when one language cannot load', async () => {
    shopifyFetch.mockImplementation(async ({ variables }) => {
      if (variables.language === 'AR') throw new Error('Arabic unavailable');
      return page('products', [item('1')]);
    });
    await expect(sitemap()).rejects.toThrow('Arabic unavailable');
  });
});
