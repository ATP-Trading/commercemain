import { getShopPolicy } from '@/lib/shopify/server';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';

interface TermsOfServicePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: TermsOfServicePageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === 'ar';

  const title = isArabic
    ? 'شروط الخدمة | ATP Trading'
    : 'Terms of Service | ATP Trading';

  const description = isArabic
    ? 'شروط الخدمة الخاصة بATP Trading. تعرف على الشروط والأحكام المتعلقة باستخدام خدماتنا.'
    : 'Terms of Service for ATP Trading. Learn about the terms and conditions for using our services.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: isArabic ? 'ar_AE' : 'en_AE',
      url: `https://atpgroupservices.com/${locale}/policies/terms-of-service`,
      siteName: isArabic ? 'ATP Trading' : 'ATP Trading',
    },
    alternates: {
      canonical: `https://atpgroupservices.com/${locale}/policies/terms-of-service`,
      languages: {
        en: 'https://atpgroupservices.com/en/policies/terms-of-service',
        ar: 'https://atpgroupservices.com/ar/policies/terms-of-service',
      },
    },
  };
}

export default async function TermsOfServicePage({
  params,
}: TermsOfServicePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const isArabic = locale === 'ar';

  const policy = await getShopPolicy('termsOfService', {
    language: locale,
    country: 'AE',
  });

  if (!policy) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-atp-gold">
            {isArabic ? 'شروط الخدمة' : 'Terms of Service'}
          </h1>
          <p className="text-neutral-400">
            {isArabic
              ? 'شروط الخدمة غير متوفرة حالياً. يرجى المحاولة لاحقاً.'
              : 'Terms of Service is currently unavailable. Please try again later.'}
          </p>
          <Link
            href={`/${locale}`}
            className="inline-block mt-8 text-atp-gold hover:underline"
          >
            {isArabic ? '← العودة للرئيسية' : '← Back to Home'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-neutral-950 text-white py-16 px-6"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/${locale}`}
          className="inline-block mb-8 text-atp-gold hover:underline"
        >
          {isArabic ? '→ العودة للرئيسية' : '← Back to Home'}
        </Link>

        <h1 className="text-3xl font-bold mb-8 text-atp-gold">{policy.title}</h1>

        <div
          className="prose prose-invert prose-lg max-w-none
            prose-headings:text-white prose-headings:font-semibold
            prose-p:text-neutral-300 prose-p:leading-relaxed
            prose-a:text-atp-gold prose-a:no-underline hover:prose-a:underline
            prose-li:text-neutral-300
            prose-strong:text-white"
          dangerouslySetInnerHTML={{ __html: policy.body }}
        />
      </div>
    </div>
  );
}
