// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const fetchShopify = vi.hoisted(() => vi.fn());
vi.mock('@/lib/shopify/server', () => ({ shopifyFetch: fetchShopify }));
import { POST } from '@/app/api/search/predictive/route';
const results = {
  products: [{ id: 'p1', handle: 'sample', title: 'Sample', vendor: 'Vendor', featuredImage: null,
    priceRange: { minVariantPrice: { amount: '20', currencyCode: 'AED' } } }],
  queries: [{ text: 'sample', styledText: '<b>sample</b>' }],
  collections: [{ id: 'c1', handle: 'collection', title: 'Collection', image: null }],
  pages: [{ id: 'page1', handle: 'about', title: 'About' }],
};
beforeEach(() => { fetchShopify.mockReset(); vi.stubGlobal('fetch', vi.fn()); });
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
function request(body: unknown) {
  return new NextRequest('https://example.test/api/search/predictive', { method: 'POST', body: JSON.stringify(body) });
}
it.each(['en', 'ar'])('preserves result groups, nullable images and %s request context', async locale => {
  fetchShopify.mockResolvedValueOnce({ body: { data: { predictiveSearch: results } } });
  const response = await POST(request({ query: ' sample ', locale }));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ success: true, results });
  expect(fetchShopify).toHaveBeenCalledExactlyOnceWith({ query: expect.any(String), variables: {
    query: 'sample', first: 10, language: locale === 'ar' ? 'AR' : 'EN', country: 'AE',
  } });
  expect(fetch).not.toHaveBeenCalled();
});
it.each([undefined, '', 5])('rejects invalid input without Shopify calls (%s)', async query => {
  const response = await POST(request({ query }));
  expect(response.status).toBe(400);
  expect(fetchShopify).not.toHaveBeenCalled();
});
it('returns the existing error response when the Shopify boundary rejects', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  fetchShopify.mockRejectedValueOnce(new Error('Unavailable'));
  const response = await POST(request({ query: 'sample', locale: 'ar' }));
  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({ error: 'Failed to perform predictive search' });
  expect(fetchShopify).toHaveBeenCalledTimes(1);
});
