import { describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/shopify/server', () => ({ getShopPolicy: vi.fn() }));
vi.mock('next-intl/server', () => ({ getTranslations: vi.fn(async () => (key: string) => key) }));
import { generateMetadata as privacy } from '@/app/[locale]/policies/privacy-policy/page';
import { generateMetadata as refund } from '@/app/[locale]/policies/refund-policy/page';
import { generateMetadata as terms } from '@/app/[locale]/policies/terms-of-service/page';
describe('policy canonical domain', () => {
  it.each([['privacy-policy', privacy], ['refund-policy', refund], ['terms-of-service', terms]] as const)('%s points both locales to the actual domain', async (slug, metadata) => {
    for (const locale of ['en', 'ar']) {
      const result = await metadata({ params: Promise.resolve({ locale }) });
      expect(result.alternates?.canonical).toBe(`https://www.atpgroupservices.ae/${locale}/policies/${slug}`);
      expect(result.openGraph?.url).toBe(result.alternates?.canonical);
      expect(result.alternates?.languages).toEqual({ en: `https://www.atpgroupservices.ae/en/policies/${slug}`, ar: `https://www.atpgroupservices.ae/ar/policies/${slug}` });
    }
  });
});
