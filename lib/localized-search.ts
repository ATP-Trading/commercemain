import type { Product } from '@/lib/shopify/types';
import { getLocalizedProductTitle } from '@/lib/shopify/i18n-queries';

export function normalizeSearchText(value: string): string {
  return value.normalize('NFKC').toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي');
}

export function matchesLocalizedTitle(product: Product, query: string, locale: 'ar' | 'en'): boolean {
  const title = normalizeSearchText(getLocalizedProductTitle(product, locale));
  const words = normalizeSearchText(query).trim().split(/\s+/).filter(Boolean);
  return words.length > 0 && words.every(word => title.includes(word));
}
