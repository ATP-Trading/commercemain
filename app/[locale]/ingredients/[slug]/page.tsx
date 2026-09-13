import { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { IngredientData } from "@/lib/programmatic-seo/data";
import { getCategoryProducts } from "@/lib/programmatic-seo/utils";
import ProductGridItems from "@/components/layout/product-grid-items";
import { Grid } from "@/components/grid";
import Link from "next/link";

interface IngredientsPageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

// Generate static params for all ingredients
export function generateStaticParams() {
  return Object.keys(IngredientData).map((slug) => ({ slug }));
}

// Generate metadata
export async function generateMetadata({
  params,
}: IngredientsPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const ingredient = IngredientData[slug];

  if (!ingredient) return {};

  const isAr = locale === "ar";
  const title = isAr
    ? `${ingredient.nameAr} | الدليل الكامل | ATP Trading`
    : ingredient.metaTitle;
  const description = isAr
    ? ingredient.descriptionAr
    : ingredient.metaDescription;
  const url = `https://www.atpgroupservices.ae/${locale}/ingredients/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `https://www.atpgroupservices.ae/en/ingredients/${slug}`,
        ar: `https://www.atpgroupservices.ae/ar/ingredients/${slug}`,
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
function generateIngredientStructuredData(
  ingredient: typeof IngredientData[string],
  slug: string,
  locale: string
) {
  const isAr = locale === "ar";
  const url = `https://www.atpgroupservices.ae/${locale}/ingredients/${slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": url,
        headline: isAr ? ingredient.nameAr : ingredient.name,
        description: isAr ? ingredient.descriptionAr : ingredient.description,
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
            url: "https://www.atpgroupservices.ae/logo.png",
          },
        },
        articleSection: isAr ? "المكونات" : "Ingredients",
        about: {
          "@type": "Thing",
          name: ingredient.scientificName || ingredient.name,
        },
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
            name: isAr ? "المكونات" : "Ingredients",
            item: `https://www.atpgroupservices.ae/${locale}/ingredients`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: isAr ? ingredient.nameAr : ingredient.name,
            item: url,
          },
        ],
      },
    ],
  };
}

export default async function IngredientsPage({ params }: IngredientsPageProps) {
  const { slug, locale: rawLocale } = await params;
  const locale = (rawLocale === "ar" ? "ar" : "en") as "en" | "ar";

  // Set locale for static rendering
  setRequestLocale(locale);

  const t = await getTranslations("common");
  const ingredient = IngredientData[slug];

  if (!ingredient) {
    notFound();
  }

  const isAr = locale === "ar";

  // Fetch products containing this ingredient
  const products = await getCategoryProducts(ingredient.products, locale);

  // Generate structured data
  const structuredData = generateIngredientStructuredData(
    ingredient,
    slug,
    locale
  );

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
        <div className="absolute inset-0 bg-[url('/ingredients-hero-bg.jpg')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-atp-black/80 via-transparent to-atp-black/40"></div>

        <div className="relative z-10 container-premium text-center text-atp-white px-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 tracking-tight">
            {isAr ? ingredient.nameAr : ingredient.name}
          </h1>
          {ingredient.scientificName && (
            <p className="text-xl text-atp-gold mb-4">
              {ingredient.scientificName}
            </p>
          )}
          <p className="text-xl md:text-2xl text-atp-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            {isAr ? ingredient.descriptionAr : ingredient.description}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="#benefits" className="btn-atp-gold">
              {isAr ? "الفوائد" : "Benefits"}
            </a>
            <a
              href="#products"
              className="btn-premium-outline text-atp-white border-atp-white hover:bg-atp-white hover:text-atp-black"
            >
              {isAr ? "المنتجات" : "Products"}
            </a>
          </div>
        </div>
      </section>

      {/* What Is Section */}
      <section className="section-padding bg-atp-white">
        <div className="container-premium max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-atp-black mb-4">
              {isAr ? `ما هو ${ingredient.nameAr}؟` : `What is ${ingredient.name}?`}
            </h2>
            <div className="w-24 h-1 bg-atp-gold mx-auto"></div>
          </div>

          <div className="bg-atp-off-white p-8 rounded-lg">
            <p className="text-atp-charcoal text-lg leading-relaxed mb-6">
              {isAr ? ingredient.descriptionAr : ingredient.description}
            </p>

            {ingredient.scientificName && (
              <div className="mt-6 p-4 bg-atp-white rounded-lg border-l-4 border-atp-gold">
                <p className="text-sm text-atp-charcoal/70 mb-1">
                  {isAr ? "الاسم العلمي" : "Scientific Name"}
                </p>
                <p className="text-lg font-semibold text-atp-black italic">
                  {ingredient.scientificName}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="section-padding bg-atp-off-white">
        <div className="container-premium">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-atp-black mb-4">
              {isAr ? `فوائد ${ingredient.nameAr}` : `${ingredient.name} Benefits`}
            </h2>
            <div className="w-24 h-1 bg-atp-gold mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(isAr ? ingredient.benefitsAr : ingredient.benefits).map(
              (benefit, index) => (
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-atp-charcoal font-medium">{benefit}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section className="section-padding bg-atp-white">
        <div className="container-premium max-w-4xl">
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-atp-black mb-2">
                  {isAr ? "معلومات السلامة" : "Safety Information"}
                </h3>
                <p className="text-atp-charcoal">
                  {isAr ? ingredient.safetyInfoAr : ingredient.safetyInfo}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="section-padding bg-atp-off-white">
        <div className="container-premium">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-atp-black mb-4">
              {isAr
                ? `منتجات تحتوي على ${ingredient.nameAr}`
                : `Products Containing ${ingredient.name}`}
            </h2>
            <div className="w-24 h-1 bg-atp-gold mx-auto mb-4"></div>
            <p className="text-atp-charcoal max-w-2xl mx-auto">
              {isAr
                ? `اكتشف منتجاتنا الممتازة المُحلاة بـ ${ingredient.nameAr}`
                : `Discover our premium products formulated with ${ingredient.name}`}
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

      {/* Related Ingredients */}
      {ingredient.relatedIngredients &&
        ingredient.relatedIngredients.length > 0 && (
          <section className="section-padding bg-atp-white">
            <div className="container-premium">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-atp-black mb-4">
                  {isAr ? "مكونات ذات صلة" : "Related Ingredients"}
                </h2>
                <div className="w-24 h-1 bg-atp-gold mx-auto"></div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {ingredient.relatedIngredients.map((relatedSlug) => {
                  const related = IngredientData[relatedSlug];
                  if (!related) return null;

                  return (
                    <Link
                      key={relatedSlug}
                      href={`/${locale}/ingredients/${relatedSlug}`}
                      className="group bg-atp-off-white p-4 rounded-lg hover:bg-atp-black hover:text-atp-white transition-colors text-center"
                    >
                      <p className="font-medium">
                        {isAr ? related.nameAr : related.name}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

      {/* CTA Section */}
      <section className="section-padding bg-atp-black text-atp-white">
        <div className="container-premium text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
            {isAr
              ? `هل تريد تجربة فوائد ${ingredient.nameAr}؟`
              : `Want to Experience ${ingredient.name} Benefits?`}
          </h2>
          <p className="text-xl text-atp-white/80 mb-8 max-w-2xl mx-auto">
            {isAr
              ? `تسوق منتجاتنا المُحلاة بـ ${ingredient.nameAr} عالي الجودة`
              : `Shop our premium products featuring ${ingredient.name}`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="#products" className="btn-atp-gold">
              {isAr ? "تسوق المنتجات" : "Shop Products"}
            </a>
            <a
              href="/contact"
              className="btn-premium-outline text-atp-white border-atp-white hover:bg-atp-white hover:text-atp-black"
            >
              {isAr ? "استشارة خبير" : "Expert Consultation"}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
