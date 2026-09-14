import 'server-only';
import { unstable_cache } from 'next/cache';
import { getSitemapResources } from './sitemap';
import { HIDDEN_PRODUCT_TAG } from '@/lib/constants';
import { isEmsPromotion } from '@/lib/publication-policy';

const catalogs = unstable_cache(async () => {
  const [en, ar] = await Promise.all([
    getSitemapResources('products', 'EN'),
    getSitemapResources('products', 'AR'),
  ]);
  return { en, ar };
}, ['product-language-links-v1'], { revalidate: 900, tags: ['products'] });

export async function getProductLanguageLinks(id: string) {
  try {
    const data = await catalogs();
    const entries = (['en', 'ar'] as const).flatMap(locale => {
      const product = data[locale].find(item => item.id === id);
      if (!product?.handle || product.tags?.includes(HIDDEN_PRODUCT_TAG) || isEmsPromotion(product.handle)) return [];
      return [[locale, `https://www.atpgroupservices.ae/${locale}/product/${encodeURIComponent(product.handle)}`]];
    });
    return entries.length === 2 ? Object.fromEntries(entries) as Record<'en' | 'ar', string> : undefined;
  } catch {
    // A catalog outage must not make an otherwise available product fail.
    return undefined;
  }
}
