import { Metadata } from "next";
import { getCollectionProducts } from "@/lib/shopify/server";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import {
  UAECities,
  LocationServices,
} from "@/lib/programmatic-seo/data";
import { generateLocationMetadata, generateLocationStructuredData } from "@/lib/programmatic-seo/utils";
import ProductGridItems from "@/components/layout/product-grid-items";
import { Grid } from "@/components/grid";

interface LocationPageProps {
  params: Promise<{
    service: string;
    city: string;
    locale: string;
  }>;
}

// Generate static params for all service/city combinations
export function generateStaticParams() {
  const params: { service: string; city: string }[] = [];

  for (const service of LocationServices) {
    for (const city of UAECities) {
      params.push({
        service: service.slug,
        city: city.slug,
      });
    }
  }

  return params;
}

// Generate metadata
export async function generateMetadata({
  params,
}: LocationPageProps): Promise<Metadata> {
  const { service, city, locale } = await params;
  return generateLocationMetadata(service, city, locale);
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { service, city, locale: rawLocale } = await params;
  const locale = (rawLocale === "ar" ? "ar" : "en") as "en" | "ar";

  // Set locale for static rendering
  setRequestLocale(locale);

  const t = await getTranslations("common");

  const serviceData = LocationServices.find((s) => s.slug === service);
  const cityData = UAECities.find((c) => c.slug === city);

  if (!serviceData || !cityData) {
    notFound();
  }

  const isAr = locale === "ar";

  // Fetch products for this service
  const products = await getCollectionProducts({
    collection: serviceData.collection,
    locale: { language: locale, country: "AE" },
  });

  // Generate structured data
  const structuredData = generateLocationStructuredData(
    service,
    city,
    products,
    locale
  );

  // Get nearby cities (exclude current city)
  const nearbyCities = UAECities.filter((c) => c.slug !== city).slice(0, 3);

  return (
    <>
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-atp-black via-atp-charcoal to-atp-black overflow-hidden">
        <div className="absolute inset-0 bg-[url('/location-hero-bg.jpg')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-atp-black/80 via-transparent to-atp-black/40"></div>

        <div className="relative z-10 container-premium text-center text-atp-white px-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 tracking-tight">
            {isAr
              ? `${serviceData.nameAr} في ${cityData.nameAr}`
              : `${serviceData.name} in ${cityData.name}`}
          </h1>
          <p className="text-xl md:text-2xl text-atp-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            {isAr
              ? `اكتشف ${serviceData.nameAr} الاحترافي في ${cityData.nameAr}. توصيل سريع وخدمة ممتازة في جميع أنحاء ${cityData.nameAr}.`
              : `Discover professional ${serviceData.name} in ${cityData.name}. Fast delivery and excellent service throughout ${cityData.name}.`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="#products" className="btn-atp-gold">
              {isAr ? "تصفح المنتجات" : "Browse Products"}
            </a>
            <a
              href="/contact"
              className="btn-premium-outline text-atp-white border-atp-white hover:bg-atp-white hover:text-atp-black"
            >
              {isAr ? "احجز استشارة" : "Book Consultation"}
            </a>
          </div>
        </div>
      </section>

      {/* Local Info Section */}
      <section className="section-padding bg-atp-white">
        <div className="container-premium">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-atp-black mb-6">
                {isAr
                  ? `${serviceData.nameAr} في ${cityData.nameAr}`
                  : `${serviceData.name} Services in ${cityData.name}`}
              </h2>
              <p className="text-atp-charcoal text-lg mb-6 leading-relaxed">
                {isAr
                  ? `نقدم ${serviceData.nameAr} الاحترافي في ${cityData.nameAr} والمناطق المجاورة. فريقنا من الخبراء جاهز لمساعدتك في تحقيق أهدافك في ${cityData.nameAr}.`
                  : `We provide professional ${serviceData.name} in ${cityData.name} and surrounding areas. Our team of experts is ready to help you achieve your goals in ${cityData.name}.`}
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-atp-gold/10 rounded-full flex items-center justify-center shrink-0">
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-atp-black mb-1">
                      {isAr ? "خدمة سريعة" : "Fast Service"}
                    </h3>
                    <p className="text-atp-charcoal">
                      {isAr
                        ? "توصيل سريع في جميع أنحاء المدينة"
                        : "Quick delivery throughout the city"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-atp-gold/10 rounded-full flex items-center justify-center shrink-0">
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
                  <div>
                    <h3 className="font-semibold text-atp-black mb-1">
                      {isAr ? "جودة مضمونة" : "Quality Guaranteed"}
                    </h3>
                    <p className="text-atp-charcoal">
                      {isAr
                        ? "منتجات أصلية 100٪ مع ضمان الجودة"
                        : "100% authentic products with quality guarantee"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-atp-gold/10 rounded-full flex items-center justify-center shrink-0">
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
                        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-atp-black mb-1">
                      {isAr ? "دعم محلي" : "Local Support"}
                    </h3>
                    <p className="text-atp-charcoal">
                      {isAr
                        ? "فريق دعم محلي يتحدث لغتك"
                        : "Local support team speaking your language"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-atp-off-white p-8 rounded-lg">
              <h3 className="text-2xl font-serif font-bold text-atp-black mb-4">
                {isAr ? "معلومات التوصيل" : "Delivery Information"}
              </h3>
              <ul className="space-y-3 text-atp-charcoal">
                <li className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-atp-gold"
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
                  {isAr
                    ? `توصيل مجاني للطلبات فوق 200 درهم في ${cityData.nameAr}`
                    : `Free delivery on orders over 200 AED in ${cityData.name}`}
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-atp-gold"
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
                  {isAr
                    ? "توصيل خلال 1-2 أيام عمل"
                    : "Delivery within 1-2 business days"}
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-atp-gold"
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
                  {isAr ? "الدفع عند الاستلام متاح" : "Cash on delivery available"}
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-atp-gold"
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
                  {isAr ? "إرجاع سهل خلال 14 يوم" : "Easy returns within 14 days"}
                </li>
              </ul>
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
                ? `منتجات ${serviceData.nameAr} في ${cityData.nameAr}`
                : `${serviceData.name} Products in ${cityData.name}`}
            </h2>
            <div className="w-24 h-1 bg-atp-gold mx-auto mb-4"></div>
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

      {/* Nearby Cities Section */}
      <section className="section-padding bg-atp-white">
        <div className="container-premium">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-atp-black mb-4">
              {isAr ? "مدن مجاورة" : "Nearby Cities"}
            </h2>
            <div className="w-24 h-1 bg-atp-gold mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nearbyCities.map((nearbyCity) => (
              <a
                key={nearbyCity.slug}
                href={`/${locale}/${service}/${nearbyCity.slug}`}
                className="group bg-atp-off-white p-6 rounded-lg hover:bg-atp-black hover:text-atp-white transition-colors"
              >
                <h3 className="text-xl font-semibold mb-2">
                  {isAr ? nearbyCity.nameAr : nearbyCity.name}
                </h3>
                <p className="text-sm opacity-70">
                  {isAr
                    ? `تصفح ${serviceData.nameAr} في ${nearbyCity.nameAr}`
                    : `Browse ${serviceData.name} in ${nearbyCity.name}`}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-atp-black text-atp-white">
        <div className="container-premium text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
            {isAr
              ? `هل تحتاج إلى ${serviceData.nameAr} في ${cityData.nameAr}؟`
              : `Need ${serviceData.name} in ${cityData.name}?`}
          </h2>
          <p className="text-xl text-atp-white/80 mb-8 max-w-2xl mx-auto">
            {isAr
              ? `اتصل بنا اليوم للحصول على ${serviceData.nameAr} الاحترافي في ${cityData.nameAr}`
              : `Contact us today for professional ${serviceData.name} in ${cityData.name}`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="/contact" className="btn-atp-gold">
              {isAr ? "اتصل بنا" : "Contact Us"}
            </a>
            <a
              href={`tel:+9714XXXXXXX`}
              className="btn-premium-outline text-atp-white border-atp-white hover:bg-atp-white hover:text-atp-black"
            >
              {isAr ? "اتصل الآن" : "Call Now"}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
