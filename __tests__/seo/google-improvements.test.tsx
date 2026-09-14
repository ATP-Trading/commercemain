import { beforeEach, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProductStructuredData } from '@/components/structured-data';
import { filterLocationProducts } from '@/lib/programmatic-seo/location-products';
import { generateLocationMetadata, generateCategoryMetadata } from '@/lib/programmatic-seo/utils';
import type { Product } from '@/lib/shopify/types';
const { resources } = vi.hoisted(() => ({ resources: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock('@/lib/shopify/sitemap', () => ({ getSitemapResources: resources }));
import { getProductLanguageLinks } from '@/lib/shopify/product-language-links';
beforeEach(() => { resources.mockReset(); });

it('links translated products by ID, even when their handles differ', async () => {
  resources.mockImplementation(async (_kind, language) => [{ id: 'same-product', handle: language === 'AR' ? 'عناية' : 'care' }]);
  expect(await getProductLanguageLinks('same-product')).toEqual({ en: 'https://www.atpgroupservices.ae/en/product/care', ar: 'https://www.atpgroupservices.ae/ar/product/%D8%B9%D9%86%D8%A7%D9%8A%D8%A9' });
});
it('does not invent a language counterpart when the catalog fails', async () => {
  resources.mockRejectedValue(new Error('offline'));
  expect(await getProductLanguageLinks('id')).toBeUndefined();
});
it('keeps soap out of supplements and supplements out of skincare', () => {
  const products = [
    { handle: 'frozen-soap-deep-clean-cool', title: 'FROZEN SOAP' },
    { handle: 'mores-collagen', title: 'كولاجين بحري' },
    { handle: 'phytovy-liv-detox', title: 'PHYTOVY LIV' },
  ] as Product[];
  expect(filterLocationProducts(products, 'supplements').map(p => p.handle)).toEqual(['mores-collagen', 'phytovy-liv-detox']);
  expect(filterLocationProducts(products, 'skincare-products').map(p => p.handle)).toEqual(['frozen-soap-deep-clean-cool']);
});
it('excludes generic city templates without excluding useful category pages', () => {
  expect(generateLocationMetadata('supplements', 'dubai', 'en').robots).toEqual({ index: false, follow: true });
  expect(generateCategoryMetadata('supplements', 'en').robots).toBeUndefined();
});
it('does not invent a brand or expiry date for a product offer', () => {
  const html = renderToStaticMarkup(<ProductStructuredData name="Product" description="Description" image="https://example.com/product.jpg" url="https://example.com/product" price="50" priceCurrency="AED" availability="InStock" />);
  const schema = JSON.parse(html.slice(html.indexOf('>') + 1, html.lastIndexOf('</script>')));
  expect(schema.brand).toBeUndefined();
  expect(schema.sku).toBeUndefined();
  expect(schema.offers.priceValidUntil).toBeUndefined();
  expect(schema.offers.price).toBe('50');
  expect(schema.offers.seller.name).toBe('ATP Trading');
});
