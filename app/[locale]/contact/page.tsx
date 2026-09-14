import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'ar' ? 'تواصل معنا' : 'Contact us',
    description: locale === 'ar' ? 'تواصل مع ATP Trading للاستفسار عن المنتجات والطلبات داخل الإمارات.' : 'Contact ATP Trading about products and orders within the UAE.',
    alternates: { canonical: `/${locale}/contact`, languages: { en: '/en/contact', ar: '/ar/contact' } },
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return <section className="max-w-4xl mx-auto px-4 py-12" dir={isAr ? 'rtl' : 'ltr'}>
    <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-8 text-center">{isAr ? 'تواصل مع ATP Trading' : 'Contact ATP Trading'}</h1>
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-semibold mb-6">{isAr ? 'كيف نقدر نساعدك؟' : 'How can we help?'}</h2>
        <p className="mb-6">{isAr ? 'تواصل معنا للاستفسار عن المنتجات أو طلبك. نخدم العملاء داخل دولة الإمارات العربية المتحدة.' : 'Contact us with questions about our products or your order. We serve customers within the United Arab Emirates.'}</p>
        <div className="space-y-4">
          <div><h3 className="font-semibold mb-2">{isAr ? 'البريد الإلكتروني' : 'Email'}</h3><a href="mailto:info@atpgroupservices.ae" className="underline" dir="ltr">info@atpgroupservices.ae</a></div>
          <div><h3 className="font-semibold mb-2">{isAr ? 'الهاتف' : 'Phone'}</h3><a href="tel:+971569586422" className="underline" dir="ltr">+971 56 958 6422</a></div>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-6">{isAr ? 'منتجاتنا' : 'Our products'}</h2>
        <ul className="space-y-4">
          <li>{isAr ? 'العناية بالبشرة والعناية الشخصية' : 'Skincare and personal care'}</li>
          <li>{isAr ? 'المكملات' : 'Supplements'}</li>
          <li>{isAr ? 'تقنيات المياه والتربة' : 'Water and soil technology'}</li>
        </ul>
      </div>
    </div>
  </section>;
}
