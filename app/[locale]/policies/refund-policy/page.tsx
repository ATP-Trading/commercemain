import { getShopPolicy } from '@/lib/shopify/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import styles from '../policy.module.css';

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
    title: { absolute: title },
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
  const isArabic = locale === 'ar';

  const policy = await getShopPolicy('refundPolicy', {
    language: locale,
    country: 'AE',
  });

  if (!policy) {
    return (
      <div className={`${styles.page} min-h-screen bg-neutral-950 text-white`}>
        <div className={styles.container}>
          <h1 className={`${styles.title} font-bold text-atp-gold`}>
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
      className={`${styles.page} min-h-screen bg-neutral-950 text-white`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className={styles.container}>
        <Link
          href={`/${locale}`}
          className="inline-block mb-8 text-atp-gold hover:underline"
        >
          {isArabic ? '→ العودة للرئيسية' : '← Back to Home'}
        </Link>

        <h1 className={`${styles.title} font-bold text-atp-gold`}>{isArabic ? 'سياسة الإرجاع والاسترداد' : 'Returns & Refunds Policy'}</h1>

        <div
          className={styles.body}
          dangerouslySetInnerHTML={{ __html: policy.body }}
        />
      </div>
    </div>
  );
}
