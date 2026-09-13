import Link from 'next/link';
import type { Metadata } from 'next';

export function inactiveServiceMetadata(locale: string, path: string): Metadata {
  return {
    title: locale === 'ar' ? 'الخدمة غير متاحة' : 'Service unavailable',
    description: locale === 'ar' ? 'تصفح منتجات ATP Trading المتاحة داخل الإمارات.' : 'Browse ATP Trading products available within the UAE.',
    robots: { index: false, follow: true },
    alternates: { canonical: `/${locale}${path}` },
  };
}

export function InactiveServicePage({ locale }: { locale: string }) {
  const isAr = locale === 'ar';
  return <section className="container-premium section-padding text-center" dir={isAr ? 'rtl' : 'ltr'}>
    <h1 className="text-3xl font-serif mb-6">{isAr ? 'الخدمة غير متاحة' : 'Service unavailable'}</h1>
    <p className="mb-8">{isAr ? 'هذه الخدمة غير متاحة حاليًا. تقدم ATP Trading منتجاتها داخل دولة الإمارات العربية المتحدة.' : 'This service is currently unavailable. ATP Trading serves customers within the United Arab Emirates.'}</p>
    <Link href={`/${locale}/search`} className="btn-atp-gold">{isAr ? 'تصفح المنتجات' : 'Browse products'}</Link>
  </section>;
}
