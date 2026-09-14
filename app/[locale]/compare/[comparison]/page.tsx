import { InactiveServicePage, inactiveServiceMetadata } from "@/components/inactive-service-page";
import { isEmsPromotion, isInactiveLocation } from "@/lib/publication-policy";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ComparisonData } from "@/lib/programmatic-seo/comparison-data";
import { getCategoryProducts } from "@/lib/programmatic-seo/utils";
import ProductGridItems from "@/components/layout/product-grid-items";
import { Grid } from "@/components/grid";

interface ComparisonPageProps {
  params: Promise<{
    comparison: string;
    locale: string;
  }>;
}

// Generate static params for all comparisons
export function generateStaticParams() {
  return Object.keys(ComparisonData).filter((slug) => !isEmsPromotion(slug)).map((comparison) => ({ comparison }));
}

// Generate metadata
export async function generateMetadata({
  params,
}: ComparisonPageProps): Promise<Metadata> {
  const { comparison, locale } = await params;
  if (comparison === "ems-vs-gym") return inactiveServiceMetadata(locale, `/compare/${comparison}`);
  const data = ComparisonData[comparison];

  if (!data) return {};

  const isAr = locale === "ar";
  const title = isAr
    ? `${data.optionAAr} vs ${data.optionBAr} | أيهما أفضل؟ | ATP Trading`
    : data.metaTitle;
  const description = isAr ? data.descriptionAr : data.description;
  const url = `https://www.atpgroupservices.ae/${locale}/compare/${comparison}`;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `https://www.atpgroupservices.ae/en/compare/${comparison}`,
        ar: `https://www.atpgroupservices.ae/ar/compare/${comparison}`,
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
function generateComparisonStructuredData(
  data: typeof ComparisonData[string],
  comparison: string,
  locale: string
) {
  const isAr = locale === "ar";
  const url = `https://www.atpgroupservices.ae/${locale}/compare/${comparison}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": url,
        headline: isAr
          ? `${data.optionAAr} مقابل ${data.optionBAr}`
          : `${data.optionA} vs ${data.optionB}`,
        description: isAr ? data.descriptionAr : data.description,
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
        articleSection: isAr ? "المقارنات" : "Comparisons",
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
            name: isAr ? "المقارنات" : "Comparisons",
            item: `https://www.atpgroupservices.ae/${locale}/compare`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: isAr
              ? `${data.optionAAr} vs ${data.optionBAr}`
              : `${data.optionA} vs ${data.optionB}`,
            item: url,
          },
        ],
      },
      // FAQ schema
      data.faqs && data.faqs.length > 0
        ? {
            "@type": "FAQPage",
            mainEntity: (isAr ? data.faqsAr : data.faqs).map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }
        : null,
    ].filter(Boolean),
  };
}

export default async function ComparisonPage({ params }: ComparisonPageProps) {
  const { comparison, locale: rawLocale } = await params;
  const locale = (rawLocale === "ar" ? "ar" : "en") as "en" | "ar";
  if (comparison === "ems-vs-gym") return <InactiveServicePage locale={locale} />;

  // Set locale for static rendering
  setRequestLocale(locale);

  const t = await getTranslations("common");
  const data = ComparisonData[comparison];

  if (!data) {
    notFound();
  }

  const isAr = locale === "ar";

  // Fetch related products
  const productsA = await getCategoryProducts(data.relatedProductsA, locale);
  const productsB = await getCategoryProducts(data.relatedProductsB, locale);
  const allProducts = [...productsA, ...productsB];

  // Generate structured data
  const structuredData = generateComparisonStructuredData(data, comparison, locale);

  // Count wins
  const aWins = data.comparisonPoints.filter((p) => p.winner === "A").length;
  const bWins = data.comparisonPoints.filter((p) => p.winner === "B").length;
  const ties = data.comparisonPoints.filter((p) => p.winner === "tie").length;

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
      <section className="relative min-h-[50vh] flex items-center justify-center bg-gradient-to-br from-atp-black via-atp-charcoal to-atp-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-atp-black/80 via-transparent to-atp-black/40"></div>

        <div className="relative z-10 container-premium text-center text-atp-white px-4">
          <h1 className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
            <span className="text-3xl md:text-5xl font-bold">{isAr ? data.optionAAr : data.optionA}</span>
            <span className="text-4xl md:text-6xl text-atp-gold font-bold">VS</span>
            <span className="text-3xl md:text-5xl font-bold">{isAr ? data.optionBAr : data.optionB}</span>
          </h1>
          <p className="text-xl md:text-2xl text-atp-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            {isAr ? data.descriptionAr : data.description}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="#comparison-table" className="btn-atp-gold">
              {isAr ? "انظر المقارنة" : "See Comparison"}
            </a>
            <a
              href="#verdict"
              className="btn-premium-outline text-atp-white border-atp-white hover:bg-atp-white hover:text-atp-black"
            >
              {isAr ? "الحكم النهائي" : "Final Verdict"}
            </a>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="section-padding bg-atp-white">
        <div className="container-premium max-w-4xl">
          <div className="bg-atp-off-white p-8 rounded-lg">
            <p className="text-atp-charcoal text-lg leading-relaxed">
              {isAr ? data.introTextAr : data.introText}
            </p>
          </div>
        </div>
      </section>

      {/* Score Card */}
      <section className="section-padding bg-atp-off-white">
        <div className="container-premium">
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-atp-white p-6 rounded-lg text-center shadow-sm">
              <p className="text-4xl font-bold text-atp-gold mb-2">{aWins}</p>
              <p className="text-sm text-atp-charcoal">
                {isAr ? data.optionAAr : data.optionA}
              </p>
            </div>
            <div className="bg-atp-white p-6 rounded-lg text-center shadow-sm">
              <p className="text-4xl font-bold text-atp-charcoal mb-2">{ties}</p>
              <p className="text-sm text-atp-charcoal">
                {isAr ? "تعادل" : "Tie"}
              </p>
            </div>
            <div className="bg-atp-white p-6 rounded-lg text-center shadow-sm">
              <p className="text-4xl font-bold text-atp-charcoal mb-2">{bWins}</p>
              <p className="text-sm text-atp-charcoal">
                {isAr ? data.optionBAr : data.optionB}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section id="comparison-table" className="section-padding bg-atp-white">
        <div className="container-premium max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-atp-black mb-4">
              {isAr ? "مقارنة مفصلة" : "Detailed Comparison"}
            </h2>
            <div className="w-24 h-1 bg-atp-gold mx-auto"></div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-atp-black text-atp-white">
                  <th className="p-4 text-left rounded-tl-lg">{isAr ? "الميزة" : "Feature"}</th>
                  <th className="p-4 text-center">{isAr ? data.optionAAr : data.optionA}</th>
                  <th className="p-4 text-center rounded-tr-lg">{isAr ? data.optionBAr : data.optionB}</th>
                </tr>
              </thead>
              <tbody>
                {data.comparisonPoints.map((point, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-atp-off-white" : "bg-atp-white"
                    } border-b border-atp-light-gray`}
                  >
                    <td className="p-4 font-semibold text-atp-black">
                      {isAr ? point.featureAr : point.feature}
                    </td>
                    <td
                      className={`p-4 text-center ${
                        point.winner === "A"
                          ? "bg-green-50 font-semibold text-green-800"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {point.winner === "A" && (
                          <svg
                            className="w-5 h-5 text-green-600"
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
                        )}
                        <span>{isAr ? point.optionAAr : point.optionA}</span>
                      </div>
                    </td>
                    <td
                      className={`p-4 text-center ${
                        point.winner === "B"
                          ? "bg-green-50 font-semibold text-green-800"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {point.winner === "B" && (
                          <svg
                            className="w-5 h-5 text-green-600"
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
                        )}
                        <span>{isAr ? point.optionBAr : point.optionB}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Verdict Section */}
      <section id="verdict" className="section-padding bg-atp-off-white">
        <div className="container-premium max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-atp-black mb-4">
              {isAr ? "الحكم النهائي" : "Final Verdict"}
            </h2>
            <div className="w-24 h-1 bg-atp-gold mx-auto"></div>
          </div>

          <div className="bg-atp-white p-8 rounded-lg shadow-md mb-8">
            <p className="text-atp-charcoal text-lg leading-relaxed mb-6">
              {isAr ? data.verdictAr : data.verdict}
            </p>
          </div>

          <div className="bg-atp-gold/10 border-l-4 border-atp-gold p-6 rounded-r-lg">
            <h3 className="text-xl font-bold text-atp-black mb-2">
              {isAr ? "توصيتنا" : "Our Recommendation"}
            </h3>
            <p className="text-atp-charcoal">
              {isAr ? data.recommendationAr : data.recommendation}
            </p>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {allProducts.length > 0 && (
        <section className="section-padding bg-atp-white">
          <div className="container-premium">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-atp-black mb-4">
                {isAr ? "منتجات ذات صلة" : "Related Products"}
              </h2>
              <div className="w-24 h-1 bg-atp-gold mx-auto"></div>
            </div>

            <Grid variant="luxury">
              <ProductGridItems products={allProducts} locale={locale} />
            </Grid>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {data.faqs && data.faqs.length > 0 && (
        <section className="section-padding bg-atp-off-white">
          <div className="container-premium max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-atp-black mb-4">
                {isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
              </h2>
              <div className="w-24 h-1 bg-atp-gold mx-auto"></div>
            </div>

            <div className="space-y-4">
              {(isAr ? data.faqsAr : data.faqs).map((faq, index) => (
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
            {isAr ? "هل ما زلت غير متأكد؟" : "Still Unsure?"}
          </h2>
          <p className="text-xl text-atp-white/80 mb-8 max-w-2xl mx-auto">
            {isAr
              ? "فريق خبرائنا جاهز لمساعدتك في اتخاذ القرار الصحيح"
              : "Our expert team is ready to help you make the right choice"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="/contact" className="btn-atp-gold">
              {isAr ? "استشارة مجانية" : "Free Consultation"}
            </a>
            <a
              href={`/${locale}/collections`}
              className="btn-premium-outline text-atp-white border-atp-white hover:bg-atp-white hover:text-atp-black"
            >
              {isAr ? "تصفح جميع المنتجات" : "Browse All Products"}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
