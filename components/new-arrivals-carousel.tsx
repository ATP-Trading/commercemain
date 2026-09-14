import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import Price from "@/components/price";
import type { Product } from "@/lib/shopify/types";
import type { Locale } from "@/lib/i18n/config";
import { getLocalizedProductHandle, getLocalizedProductTitle } from "@/lib/shopify/i18n-queries";

interface NewArrivalsCarouselProps {
  products: Product[];
  carouselProducts: Product[];
  locale: Locale;
}

function ProductCard({ product, locale }: { product: Product; locale: Locale }) {
  const title = getLocalizedProductTitle(product, locale);
  const price = product.priceRange.minVariantPrice;
  return (
    <article className="h-full overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <Link
        href={`/${locale}/product/${getLocalizedProductHandle(product, locale)}`}
        className="group flex h-full flex-col rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-atp-gold"
      >
        <div className="relative aspect-square bg-neutral-50">
          <Image
            src={product.featuredImage?.url || "/placeholder.svg"}
            alt={title}
            fill
            className="object-contain p-5 transition-transform duration-300 motion-safe:group-hover:scale-105 sm:p-8"
            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
          />
        </div>
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <h3 className="mb-3 text-base font-semibold leading-relaxed text-neutral-900 sm:text-lg">{title}</h3>
          <Price amount={price.amount} currencyCode={price.currencyCode} className="mt-auto text-lg font-semibold text-neutral-900" />
          <span className="mt-4 flex min-h-11 items-center border-t border-neutral-200 pt-3 text-sm font-medium text-[#765b19] group-hover:underline">
            {locale === "ar" ? "عرض المنتج" : "View product"}
          </span>
        </div>
      </Link>
    </article>
  );
}

export async function NewArrivalsCarousel({ products, carouselProducts, locale }: NewArrivalsCarouselProps) {
  const [t, tProduct] = await Promise.all([
    getTranslations({ locale, namespace: "homepage" }),
    getTranslations({ locale, namespace: "product" }),
  ]);
  const sections = [
    { id: "new-arrivals", title: locale === "ar" ? "منتجاتنا الجديدة" : "New arrivals", items: carouselProducts.slice(0, 4) },
    { id: "featured-products", title: t("featuredProductsTitle"), items: products.slice(0, 5) },
  ].filter((section) => section.items.length > 0);

  if (!sections.length) return null;

  return (
    <div className="bg-[#faf9f6] py-12 sm:py-16">
      <div className="container-premium space-y-14 px-4 sm:space-y-20 sm:px-6 lg:px-8">
        {sections.map((section) => (
          <section key={section.id} aria-labelledby={`${section.id}-title`}>
            <h2 id={`${section.id}-title`} className="mb-7 text-2xl font-semibold leading-snug text-neutral-900 sm:mb-9 sm:text-3xl lg:text-4xl">
              {section.title}
            </h2>
            <div className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {section.items.map((product) => <ProductCard key={product.id} product={product} locale={locale} />)}
            </div>
          </section>
        ))}
        <div className="text-center">
          <Link href={`/${locale}/collections/amazing-thai-products`} className="inline-flex min-h-12 items-center justify-center rounded-full bg-neutral-950 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-neutral-800">
            {tProduct("viewAllProducts")}
          </Link>
        </div>
      </div>
    </div>
  );
}
