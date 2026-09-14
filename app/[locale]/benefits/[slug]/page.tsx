import { EditorialSources } from "@/components/seo/editorial-sources";
import { InactiveServicePage, inactiveServiceMetadata } from "@/components/inactive-service-page";
import { isEmsPromotion, isInactiveLocation } from "@/lib/publication-policy";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { BenefitData, FAQ } from "@/lib/programmatic-seo/data";
import { getCategoryProducts } from "@/lib/programmatic-seo/utils";
import ProductGridItems from "@/components/layout/product-grid-items";
import { Grid } from "@/components/grid";

interface BenefitsPageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

// Generate static params for all benefits
export function generateStaticParams() {
  return Object.keys(BenefitData).filter((slug) => !isEmsPromotion(slug)).map((slug) => ({ slug }));
}

// Generate metadata
export async function generateMetadata({
  params,
}: BenefitsPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  if (slug === "ems-weight-loss") return inactiveServiceMetadata(locale, `/benefits/${slug}`);
  const benefit = BenefitData[slug];

  if (!benefit) return {};

  const isAr = locale === "ar";
  const title = isAr
    ? `${benefit.benefitAr} | ATP Trading`
    : benefit.metaTitle;
  const description = isAr ? benefit.descriptionAr : benefit.metaDescription;
  const url = `https://www.atpgroupservices.ae/${locale}/benefits/${slug}`;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `https://www.atpgroupservices.ae/en/benefits/${slug}`,
        ar: `https://www.atpgroupservices.ae/ar/benefits/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
    },
  };
}

// Generate structured data
function generateBenefitStructuredData(
  benefit: typeof BenefitData[string],
  slug: string,
  locale: string
) {
  const isAr = locale === "ar";
  const url = `https://www.atpgroupservices.ae/${locale}/benefits/${slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": url,
        headline: isAr ? benefit.benefitAr : benefit.benefit,
        description: isAr ? benefit.descriptionAr : benefit.description,
        url,
        author: {
          "@type": "Organization",
          name: "ATP Trading",
          url: "https://www.atpgroupservices.ae",
        },
        publisher: {
          "@type": "Organization",
          name: "ATP Trading",
          logo: {
            "@type": "ImageObject",
            url: "https://www.atpgroupservices.ae/images/atp-logo.png",
          },
        },
        articleSection: isAr ? "الفوائد الصحية" : "Health Benefits",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: isAr ? "الرئيسية" : "Home",
            item: `https://www.atpgroupservices.ae/${locale}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: isAr ? "الفوائد" : "Benefits",
            item: `https://www.atpgroupservices.ae/${locale}/search`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: isAr ? benefit.benefitAr : benefit.benefit,
            item: url,
          },
        ],
      },
      // FAQ schema
      benefit.faqs && benefit.faqs.length > 0
        ? {
            "@type": "FAQPage",
            mainEntity: (isAr ? benefit.faqsAr : benefit.faqs).map(
              (faq: FAQ) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer,
                },
              })
            ),
          }
        : null,
    ].filter(Boolean),
  };
}

export default async function BenefitsPage({ params }: BenefitsPageProps) {
  const { slug, locale: rawLocale } = await params;
  const locale = (rawLocale === "ar" ? "ar" : "en") as "en" | "ar";
  if (slug === "ems-weight-loss") return <InactiveServicePage locale={locale} />;

  // Set locale for static rendering
  setRequestLocale(locale);

  const t = await getTranslations("common");
  const benefit = BenefitData[slug];

  if (!benefit) {
    notFound();
  }

  const isAr = locale === "ar";

  // Fetch related products
  const products = await getCategoryProducts(benefit.relatedProducts, locale);

  // Generate structured data
  const structuredData = generateBenefitStructuredData(benefit, slug, locale);

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-atp-black via-atp-charcoal to-atp-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-atp-black/80 via-transparent to-atp-black/40"></div>

        <div className="relative z-10 container-premium text-center text-atp-white px-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 tracking-tight">
            {isAr ? benefit.benefitAr : benefit.benefit}
          </h1>
          <p className="text-xl md:text-2xl text-atp-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            {isAr ? benefit.descriptionAr : benefit.description}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="#science" className="btn-atp-gold">
              {isAr ? "الدليل العلمي" : "The Science"}
            </a>
            <a
              href="#products"
              className="btn-premium-outline text-atp-white border-atp-white hover:bg-atp-white hover:text-atp-black"
            >
              {isAr ? "المنتجات ذات الصلة" : "Related Products"}
            </a>
          </div>
        </div>
      </section>

      {/* Science Section */}
      <section id="science" className="section-padding bg-atp-white">
        <div className="container-premium max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-atp-black mb-4">
              {isAr ? "الدليل العلمي" : "The Science Behind It"}
            </h2>
            <div className="w-24 h-1 bg-atp-gold mx-auto"></div>
          </div>

          <div className="bg-atp-off-white p-8 rounded-lg">
            <p className="text-atp-charcoal text-lg leading-relaxed mb-6">
              {isAr
                ? benefit.scienceExplanationAr
                : benefit.scienceExplanation}
            </p>

            {/* How to Use */}
            <div className="mt-8">
              <h3 className="text-2xl font-serif font-bold text-atp-black mb-4">
                {isAr ? "كيفية الاستخدام" : "How to Use"}
              </h3>
              <ul className="space-y-3">
                {(isAr ? benefit.howToUseAr : benefit.howToUse).map(
                  (step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-8 h-8 bg-atp-gold text-white rounded-full flex items-center justify-center font-bold shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-atp-charcoal pt-1">{step}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Grid */}
      <section className="section-padding bg-atp-off-white">
        <div className="container-premium">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-atp-black mb-4">
              {isAr ? "ما ينبغي مراجعته" : "What to Check"}
            </h2>
            <div className="w-24 h-1 bg-atp-gold mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(isAr ? benefit.benefitsAr : benefit.benefits)?.map(
              (item, index) => (
                <div
                  key={index}
                  className="bg-atp-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-atp-gold/10 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-atp-gold"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-atp-charcoal font-medium">{item}</p>
                </div>
              )
            ) || (
              <p className="text-atp-charcoal col-span-3 text-center">
                {isAr ? "لا توجد فوائد مدرجة" : "No benefits listed"}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="section-padding bg-atp-white">
        <div className="container-premium">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-atp-black mb-4">
              {isAr
                ? "منتجات ذات صلة"
                : "Related Products"}
            </h2>
            <div className="w-24 h-1 bg-atp-gold mx-auto mb-4"></div>
            <p className="text-atp-charcoal max-w-2xl mx-auto">
              {isAr
                ? "قارن المنتجات وراجع المكونات والمواصفات وطريقة الاستخدام."
                : "Compare products and review ingredients, specifications and directions."}
            </p>
          </div>

          {products.length > 0 ? (
            <Grid variant="luxury">
              <ProductGridItems products={products} locale={locale} />
            </Grid>
          ) : (
            <div className="text-center py-16">
              <p className="text-atp-charcoal text-lg">
                {isAr
                  ? "لا توجد منتجات متاحة حالياً"
                  : "No products available at the moment"}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      {benefit.faqs && benefit.faqs.length > 0 && (
        <section className="section-padding bg-atp-off-white">
          <div className="container-premium max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-atp-black mb-4">
                {isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
              </h2>
              <div className="w-24 h-1 bg-atp-gold mx-auto"></div>
            </div>

            <div className="space-y-4">
              {(isAr ? benefit.faqsAr : benefit.faqs).map((faq, index) => (
                <details
                  key={index}
                  className="group bg-atp-white rounded-lg [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-1.5 rounded-lg p-4 text-atp-black font-semibold">
                    {faq.question}
                    <span className="relative size-5 shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="absolute inset-0 size-5 opacity-100 group-open:opacity-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="absolute inset-0 size-5 opacity-0 group-open:opacity-100"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </span>
                  </summary>
                  <div className="p-4 pt-0 text-atp-charcoal leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section-padding bg-atp-black text-atp-white">
        <div className="container-premium text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
            {isAr
              ? "هل تحتاج مساعدة في الاختيار؟"
              : "Need help choosing?"}
          </h2>
          <p className="text-xl text-atp-white/80 mb-8 max-w-2xl mx-auto">
            {isAr
              ? "تصفح المنتجات أو تواصل معنا للاستفسار عن تفاصيلها."
              : "Browse products or contact us with questions about their details."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="#products" className="btn-atp-gold">
              {isAr ? "تسوق المنتجات" : "Shop Products"}
            </a>
            <a
              href={`/${locale}/contact`}
              className="btn-premium-outline text-atp-white border-atp-white hover:bg-atp-white hover:text-atp-black"
            >
              {isAr ? "تواصل معنا" : "Contact Us"}
            </a>
          </div>
        </div>
      </section>
      <EditorialSources slug={slug} locale={locale} />
    </>
  );
}
