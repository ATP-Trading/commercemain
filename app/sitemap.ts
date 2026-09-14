import { canonicalCollectionHandle } from '@/lib/collection-handle';
import { isEmsPromotion, isInactiveCollection } from '@/lib/publication-policy';
import { HIDDEN_PRODUCT_TAG } from '@/lib/constants';
import { getSitemapResources, type SitemapResource } from '@/lib/shopify/sitemap';
import { baseUrl, validateEnvironmentVariables } from '@/lib/utils';
import { CategoryData, BenefitData, IngredientData } from '@/lib/programmatic-seo/data';
import { ComparisonData } from '@/lib/programmatic-seo/comparison-data';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';
const locales = ['en', 'ar'] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  validateEnvironmentVariables();
  // Only implemented public pages: Shopify CMS handles do not have a catch-all route.
  const paths = ['', '/about', '/contact',
    '/policies/privacy-policy', '/policies/refund-policy', '/policies/terms-of-service'];
  for (const [prefix, data] of Object.entries({ category: CategoryData, benefits: BenefitData,
    ingredients: IngredientData, compare: ComparisonData })) {
    paths.push(...Object.keys(data).filter(slug => !isEmsPromotion(slug)).map(slug => `/${prefix}/${slug}`));
  }
  // Generic city templates remain available to visitors but are not promoted for indexing.

  // Omit lastModified when no actual content modification date is available.
  const routes: MetadataRoute.Sitemap = paths.flatMap(path => locales.map(locale => ({ url: `${baseUrl}/${locale}${path}` })));
  for (const kind of ['products', 'collections'] as const) {
    const [en, ar] = await Promise.all([getSitemapResources(kind, 'EN'), getSitemapResources(kind, 'AR')]);
    const catalogs = { en, ar };
    const visible = (item: SitemapResource) => Boolean(item.handle) &&
      !isEmsPromotion(`${item.handle} ${item.title}`) &&
      (kind === 'products' ? !item.tags?.includes(HIDDEN_PRODUCT_TAG) : !item.handle.startsWith('hidden') && !isInactiveCollection(item.handle));
    const routePath = kind === 'products' ? 'product' : 'collections';
    for (const locale of locales) {
      for (const item of catalogs[locale].filter(visible)) {
        routes.push({
          url: `${baseUrl}/${locale}/${routePath}/${encodeURIComponent(kind === 'collections' ? canonicalCollectionHandle(item.handle) : item.handle)}`,
          ...(item.updatedAt && Number.isFinite(Date.parse(item.updatedAt)) ? { lastModified: item.updatedAt } : {}),
        });
      }
    }
  }
  const unique = [...new Map(routes.map(route => [route.url, route])).values()];
  if (unique.length > 50_000) throw new Error('Sitemap exceeds 50,000 URLs; split into multiple sitemaps.');
  return unique;
}
