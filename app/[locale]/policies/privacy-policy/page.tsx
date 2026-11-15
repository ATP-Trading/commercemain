import { getShopPolicy } from '@/lib/shopify/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import styles from '../policy.module.css';

interface PrivacyPolicyPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PrivacyPolicyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === 'ar';

  const title = isArabic
    ? 'سياسة الخصوصية | ATP Trading'
    : 'Privacy Policy | ATP Trading';

  const description = isArabic
    ? 'سياسة الخصوصية الخاصة بATP Trading. تعرف على كيفية جمع واستخدام وحماية معلوماتك الشخصية.'
    : 'Privacy Policy for ATP Trading. Learn how we collect, use, and protect your personal information.';

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: isArabic ? 'ar_AE' : 'en_AE',
      url: `https://www.atpgroupservices.ae/${locale}/policies/privacy-policy`,
      siteName: isArabic ? 'ATP Trading' : 'ATP Trading',
    },
    alternates: {
      canonical: `https://www.atpgroupservices.ae/${locale}/policies/privacy-policy`,
      languages: {
        en: 'https://www.atpgroupservices.ae/en/policies/privacy-policy',
        ar: 'https://www.atpgroupservices.ae/ar/policies/privacy-policy',
      },
    },
  };
}

export default async function PrivacyPolicyPage({
  params,
}: PrivacyPolicyPageProps) {
  const { locale } = await params;
  const isArabic = locale === 'ar';

  const policy = await getShopPolicy('privacyPolicy', {
    language: locale,
    country: 'AE',
  });

  if (!policy) {
    return (
      <div className={`${styles.page} min-h-screen bg-neutral-950 text-white`}>
        <div className={styles.container}>
          <h1 className={`${styles.title} font-bold text-atp-gold`}>
            {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </h1>
          <p className="text-neutral-400">
            {isArabic
              ? 'سياسة الخصوصية غير متوفرة حالياً. يرجى المحاولة لاحقاً.'
              : 'Privacy Policy is currently unavailable. Please try again later.'}
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

        <h1 className={`${styles.title} font-bold text-atp-gold`}>{isArabic ? 'سياسة الخصوصية' : policy.title}</h1>

        <section className={`${styles.body} ${styles.notice}`}>
          <h2 >{isArabic ? 'التحليلات والإعلانات' : 'Analytics and advertising'}</h2>
          <p >{isArabic ? 'نقيس زيارات الصفحات العامة عبر Shopify عندما تسمح إعدادات الخصوصية بذلك. تحليلات Google وتتبع إعلانات Google وMeta متوقفة. تبقى ملفات الارتباط الضرورية لتشغيل السلة وتسجيل الدخول وإتمام الطلب. تعالج خدمات الدفع الطلبات وفق سياسات الخصوصية الخاصة بها.' : 'Shopify measures public page visits when privacy settings allow it. Google Analytics and Google and Meta advertising tracking are disabled. Essential cookies remain for the cart, sign-in and checkout. Payment services process orders under their own privacy policies.'}</p>
        </section>

        <div
          className={styles.body}
          dangerouslySetInnerHTML={{ __html: policy.body }}
        />
      </div>
    </div>
  );
}
