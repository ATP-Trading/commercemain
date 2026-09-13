import { beforeEach, describe, expect, it, vi } from 'vitest';
const { getCollection, getCollectionProducts } = vi.hoisted(() => ({ getCollection: vi.fn(), getCollectionProducts: vi.fn() }));
vi.mock('@/lib/shopify/server', () => ({ getCollection, getCollectionProducts }));
vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('NEXT_HTTP_ERROR_FALLBACK;404'); } }));
vi.mock('@/components/collection/collection-hero', () => ({ default: () => null }));
vi.mock('@/components/collections/collection-page-client', () => ({ default: () => null }));
vi.mock('@/components/product/product-card-skeleton', () => ({ CollectionPageSkeleton: () => null }));
import CollectionPage, { generateMetadata } from '@/app/[locale]/collections/[handle]/page';
import { generateMetadata as legacyMetadata } from '@/app/[locale]/search/[collection]/layout';

describe('collection indexing', () => {
  beforeEach(() => { vi.clearAllMocks(); getCollectionProducts.mockResolvedValue([]); });
  it('uses the collection canonical rather than the locale homepage', async () => {
    getCollection.mockResolvedValue({ handle: 'translated-handle', title: 'Collection', description: '', seo: { title: 'Custom SEO title' } });
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'ar', handle: 'requested-handle' }) });
    expect(metadata.alternates?.canonical).toBe('/ar/collections/translated-handle');
    expect(metadata.title).toBe('Custom SEO title');
    expect(getCollection).toHaveBeenCalledWith('requested-handle', { language: 'AR', country: 'AE' });
  });
  it('points the older search collection route at the same canonical', async () => {
    getCollection.mockResolvedValue({ handle: 'skincare', title: 'Skincare' });
    const metadata = await legacyMetadata({ params: Promise.resolve({ locale: 'en', collection: 'skincare' }) });
    expect(metadata.alternates?.canonical).toBe('/en/collections/skincare');
  });
  it('returns not-found for both metadata and rendering of a missing collection', async () => {
    getCollection.mockResolvedValue(undefined);
    const props = { params: Promise.resolve({ locale: 'en', handle: 'missing' }) };
    await expect(generateMetadata(props)).rejects.toThrow('404');
    await expect(CollectionPage(props)).rejects.toThrow('404');
  });
});
