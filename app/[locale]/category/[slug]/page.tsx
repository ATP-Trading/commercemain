import { InactiveServicePage, inactiveServiceMetadata } from "@/components/inactive-service-page";
import { isEmsPromotion, isInactiveLocation } from "@/lib/publication-policy";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { CategoryData } from "@/lib/programmatic-seo/data";
import { getCategoryProducts, generateCategoryMetadata, generateCategoryStructuredData } from "@/lib/programmatic-seo/utils";
import ProductGridItems from "@/components/layout/product-grid-items";
import { Grid } from "@/components/grid";
import { StructuredData } from "@/components/structured-data";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

// Generate static params for all categories
export function generateStaticParams() {
  return Object.keys(CategoryData).filter((slug) => !isEmsPromotion(slug)).map((slug) => ({ slug }));
}

// Generate metadata
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  if (slug === "ems-training") return inactiveServiceMetadata(locale, `/category/${slug}`);
  return generateCategoryMetadata(slug, locale);
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug, locale: rawLocale } = await params;
  const locale = (rawLocale === "ar" ? "ar" : "en") as "en" | "ar";
  if (slug === "ems-training") return <InactiveServicePage locale={locale} />;

  // Set locale for static rendering
  setRequestLocale(locale);

  const t = await getTranslations("common");
  const category = CategoryData[slug];

  if (!category) {
    notFound();
  }

  const isAr = locale === "ar";

  // Fetch products for this category
  const products = await getCategoryProducts(category.products, locale);

  // Generate structured data
  const structuredData = generateCategoryStructuredData(category, products, locale);

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
            {isAr ? category.nameAr : category.name}
          </h1>
          <p className="text-xl md:text-2xl text-atp-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            {isAr ? category.descriptionAr : category.description}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#products"
              className="btn-atp-gold"
            >
              {isAr ? "تسوق الآن" : "Shop Now"}
            </a>
            <a
              href="#benefits"
              className="btn-premium-outline text-atp-white border-atp-white hover:bg-atp-white hover:text-atp-black"
            >
              {isAr ? "المزايا" : "Benefits"}
            </a>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="section-padding bg-atp-white">
        <div className="container-premium">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-atp-black mb-4">
              {isAr ? "لماذا تختارنا؟" : `Why Choose Our ${category.name}?`}
            </h2>
            <div className="w-24 h-1 bg-atp-gold mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(isAr ? category.benefitsAr : category.benefits).map(
              (benefit, index) => (
                <div
                  key={index}
                  className="bg-atp-off-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-atp-gold/10 rounded-full flex items-center justify-center mb-4">
                    <span className="text-atp-gold font-bold text-xl">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-atp-charcoal">{benefit}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="section-padding bg-atp-off-white">
        <div className="container-premium">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-atp-black mb-4">
              {isAr ? "منتجاتنا" : `Our ${category.name} Products`}
            </h2>
            <div className="w-24 h-1 bg-atp-gold mx-auto mb-4"></div>
            <p className="text-atp-charcoal max-w-2xl mx-auto">
              {isAr
                ? "اكتشف مجموعتنا المختارة من المنتجات عالية الجودة"
                : "Discover our curated collection of premium products"}
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
      {category.faqs && category.faqs.length > 0 && (
        <section className="section-padding bg-atp-white">
          <div className="container-premium max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-atp-black mb-4">
                {isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
              </h2>
              <div className="w-24 h-1 bg-atp-gold mx-auto"></div>
            </div>

            <div className="space-y-4">
              {(isAr ? category.faqsAr : category.faqs).map((faq, index) => (
                <details
                  key={index}
                  className="group bg-atp-off-white rounded-lg [&_summary::-webkit-details-marker]:hidden"
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
              ? "هل تحتاج إلى مساعدة في الاختيار؟"
              : "Need Help Choosing?"}
          </h2>
          <p className="text-xl text-atp-white/80 mb-8 max-w-2xl mx-auto">
            {isAr
              ? "فريقنا متاح لمساعدتك في العثور على المنتج المثالي لاحتياجاتك"
              : "Our team is available to help you find the perfect product for your needs"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href={`/${locale}/contact`} className="btn-atp-gold">
              {isAr ? "اتصل بنا" : "Contact Us"}
            </a>
            <a
              href={`/${locale}/collections`}
              className="btn-premium-outline text-atp-white border-atp-white hover:bg-atp-white hover:text-atp-black"
            >
              {isAr ? "عرض جميع المنتجات" : "View All Products"}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
