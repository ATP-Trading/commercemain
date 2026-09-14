import { filterLocationProducts } from "@/lib/programmatic-seo/location-products";
import { InactiveServicePage, inactiveServiceMetadata } from "@/components/inactive-service-page";
import { isEmsPromotion, isInactiveLocation } from "@/lib/publication-policy";
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
      if (isInactiveLocation(service.slug, city.slug)) continue;
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
  if (LocationServices.some(s => s.slug === service) && UAECities.some(c => c.slug === city) && isInactiveLocation(service, city)) return inactiveServiceMetadata(locale, `/${service}/${city}`);
  return generateLocationMetadata(service, city, locale);
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { service, city, locale: rawLocale } = await params;
  const locale = (rawLocale === "ar" ? "ar" : "en") as "en" | "ar";
  if (LocationServices.some(s => s.slug === service) && UAECities.some(c => c.slug === city) && isInactiveLocation(service, city)) return <InactiveServicePage locale={locale} />;

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
  const products = filterLocationProducts(await getCollectionProducts({
    collection: serviceData.collection,
    locale: { language: isAr ? "AR" : "EN", country: "AE" },
  }), service);

  // Generate structured data
  const structuredData = generateLocationStructuredData(
    service,
    city,
    products,
    locale
  );

  // Get nearby cities (exclude current city)
  const nearbyCities = UAECities.filter((c) => c.country === "AE" && c.slug !== city).slice(0, 3);

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
        <div className="absolute inset-0 bg-gradient-to-t from-atp-black/80 via-transparent to-atp-black/40"></div>

        <div className="relative z-10 container-premium text-center text-atp-white px-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6 tracking-tight">
            {isAr
              ? `${serviceData.nameAr} في ${cityData.nameAr}`
              : `${serviceData.name} in ${cityData.name}`}
          </h1>
          <p className="text-xl md:text-2xl text-atp-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            {isAr
              ? `تصفح ${serviceData.nameAr} المتاحة للطلب والتوصيل إلى ${cityData.nameAr}. راجع تفاصيل كل منتج قبل الشراء.`
              : `Browse ${serviceData.name} available to order for delivery to ${cityData.name}. Review each product’s details before buying.`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="#products" className="btn-atp-gold">
              {isAr ? "تصفح المنتجات" : "Browse Products"}
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

      {/* Local Info Section */}
      <section className="section-padding bg-atp-white">
        <div className="container-premium">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-atp-black mb-6">
                {isAr
                  ? `${serviceData.nameAr} في ${cityData.nameAr}`
                  : `${serviceData.name} in ${cityData.name}`}
              </h2>
              <p className="text-atp-charcoal text-lg mb-6 leading-relaxed">
                {isAr
                  ? `يمكنك طلب منتجاتنا عبر الموقع للتوصيل إلى ${cityData.nameAr}. تواصل معنا إذا احتجت مساعدة في اختيار المنتج أو تأكيد ترتيبات التوصيل.`
                  : `Order online for delivery to ${cityData.name}. Contact us for help with product information or delivery arrangements.`}
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
                      {isAr ? "توصيل داخل الإمارات" : "UAE Delivery"}
                    </h3>
                    <p className="text-atp-charcoal">
                      {isAr
                        ? "تظهر تفاصيل التوصيل عند إتمام الطلب"
                        : "Delivery details are shown at checkout"}
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
                      {isAr ? "معلومات المنتج" : "Product Information"}
                    </h3>
                    <p className="text-atp-charcoal">
                      {isAr
                        ? "راجع المواصفات وطريقة الاستخدام قبل الشراء"
                        : "Review specifications and use instructions before buying"}
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
                      {isAr ? "مساعدة في الطلب" : "Order Support"}
                    </h3>
                    <p className="text-atp-charcoal">
                      {isAr
                        ? "فريق مساعدة في الطلب يتحدث لغتك"
                        : "Contact us in Arabic or English"}
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
                    ? "التوصيل ١٥ درهمًا للطلبات أقل من ٢٥٠ درهمًا، ومجاني من ٢٥٠ درهمًا"
                    : "Delivery is AED 15 below AED 250, and free from AED 250"}
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
                    ? "توصيل مجاني داخل الإمارات لأعضاء ATP الفعّالين"
                    : "Free UAE delivery for active ATP members"}
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
                  {isAr ? "وسائل الدفع المتاحة تظهر عند إتمام الطلب" : "Available payment methods are shown at checkout"}
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
                  {isAr ? "طلب إرجاع المنتج السليم غير المفتوح خلال ٣ أيام وفق سياسة الاسترداد" : "Request return of unopened, undamaged products within 3 days, subject to the refund policy"}
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

      {/* Other UAE Locations Section */}
      <section className="section-padding bg-atp-white">
        <div className="container-premium">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-atp-black mb-4">
              {isAr ? "مدن أخرى داخل الإمارات" : "Other UAE Locations"}
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
              ? "تواصل معنا للمساعدة في معلومات المنتجات والتوصيل."
              : "Contact us for help with product and delivery information."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href={`/${locale}/contact`} className="btn-atp-gold">
              {isAr ? "اتصل بنا" : "Contact Us"}
            </a>
            <a
              href={`/${locale}/policies/refund-policy`}
              className="btn-premium-outline text-atp-white border-atp-white hover:bg-atp-white hover:text-atp-black"
            >
              {isAr ? "سياسة الاسترداد" : "Refund Policy"}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
