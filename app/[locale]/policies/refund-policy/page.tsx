import { getShopPolicy } from '@/lib/shopify/server';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';

interface RefundPolicyPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: RefundPolicyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === 'ar';

  const title = isArabic
    ? 'سياسة الاسترداد | ATP Trading'
    : 'Refund Policy | ATP Trading';

  const description = isArabic
    ? 'سياسة الاسترداد والإرجاع الخاصة بATP Trading. تعرف على شروط وإجراءات الإرجاع والاسترداد.'
    : 'Refund and Return Policy for ATP Trading. Learn about our return and refund terms and procedures.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: isArabic ? 'ar_AE' : 'en_AE',
      url: `https://www.atpgroupservices.ae/${locale}/policies/refund-policy`,
      siteName: isArabic ? 'ATP Trading' : 'ATP Trading',
    },
    alternates: {
      canonical: `https://www.atpgroupservices.ae/${locale}/policies/refund-policy`,
      languages: {
        en: 'https://www.atpgroupservices.ae/en/policies/refund-policy',
        ar: 'https://www.atpgroupservices.ae/ar/policies/refund-policy',
      },
    },
  };
}

export default async function RefundPolicyPage({
  params,
}: RefundPolicyPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const isArabic = locale === 'ar';

  const policy = await getShopPolicy('refundPolicy', {
    language: locale,
    country: 'AE',
  });

  if (!policy) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-atp-gold">
            {isArabic ? 'سياسة الاسترداد' : 'Refund Policy'}
          </h1>
          <p className="text-neutral-400">
            {isArabic
              ? 'سياسة الاسترداد غير متوفرة حالياً. يرجى المحاولة لاحقاً.'
              : 'Refund Policy is currently unavailable. Please try again later.'}
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
