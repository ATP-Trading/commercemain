import { getShopPolicy } from '@/lib/shopify/server';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AnalyticsSettingsButton } from '@/components/analytics/google-analytics';

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
  const t = await getTranslations({ locale, namespace: 'common' });
  const isArabic = locale === 'ar';

  const policy = await getShopPolicy('privacyPolicy', {
    language: locale,
    country: 'AE',
  });

  if (!policy) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-atp-gold">
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

        <section className="mb-8 rounded-xl border border-neutral-700 p-6 text-neutral-300">
          <h2 className="mb-3 text-xl font-semibold text-white">{isArabic ? 'تحليلات الموقع' : 'Website analytics'}</h2>
          <p className="text-base leading-7">{isArabic ? 'بموافقتك، نستخدم Google Analytics لقياس زيارات الصفحات والتفاعل مع المنتجات وتحسين تجربة التسوق. لا نرسل اسمك أو بريدك أو رقم هاتفك ضمن أحداث تحليلات واجهة الموقع. يمكنك تغيير اختيارك من تفضيلات التحليلات في أسفل الصفحة.' : 'With your consent, we use Google Analytics to measure page visits and product interactions and improve the shopping experience. We do not include your name, email or phone number in storefront analytics events. You can change your choice using Analytics preferences in the footer.'}</p>
          <a className="mt-3 block text-atp-gold underline" href="https://policies.google.com/technologies/partner-sites">{isArabic ? 'كيف تستخدم Google البيانات' : 'How Google uses data'}</a>
          <AnalyticsSettingsButton />
        </section>

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
