import { ProductAnalytics } from "@/components/analytics/google-analytics";
import { getProductLanguageLinks } from "@/lib/shopify/product-language-links";
import { InactiveServicePage, inactiveServiceMetadata } from "@/components/inactive-service-page";
import { isEmsPromotion } from "@/lib/publication-policy";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ATPLuxuryGallery } from "@/components/product/atp-luxury-gallery";
import { ProductProvider } from "@/components/product/product-context";
import { ATPProductDescription } from "@/components/product/atp-product-description";
import { EnhancedRelatedProducts } from "@/components/product/enhanced-related-products";
import { ProductStructuredData, BreadcrumbStructuredData } from "@/components/structured-data";
import { HIDDEN_PRODUCT_TAG } from "@/lib/constants";
import { getProduct, getProductRecommendations } from "@/lib/shopify/server";
import {
  getLocalizedProductTitle,
  getLocalizedProductDescription,
} from "@/lib/shopify/i18n-queries";
import type { Image } from "@/lib/shopify/types";
import Link from "next/link";
import { Suspense } from "react";

// Helper function to generate rich meta descriptions
const generateMetaDescription = (product: any, locale: "en" | "ar") => {
  const price = `${product.priceRange.minVariantPrice.currencyCode} ${product.priceRange.minVariantPrice.amount}`;
  const availability = product.availableForSale
    ? (locale === "ar" ? "متوفر" : "In Stock")
    : (locale === "ar" ? "غير متوفر" : "Out of Stock");

  const baseDesc = getLocalizedProductDescription(product, locale);
  const truncated = baseDesc.slice(0, 120);

  return locale === "ar"
    ? `${truncated}... | ${price} | ${availability} | شحن مجاني من 250 درهم داخل الإمارات`
    : `${truncated}... | ${price} | ${availability} | Free UAE shipping from AED 250`;
};

// Helper function to ensure proper alt text for images
const getImageAlt = (altText: string | undefined | null, productTitle: string, index: number): string => {
  if (altText && altText.trim()) return altText;
  return `${productTitle} - Product Image ${index + 1}`;
};

export async function generateMetadata(props: {
  params: Promise<{ handle: string; locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  if (isEmsPromotion(params.handle)) return inactiveServiceMetadata(params.locale, `/product/${params.handle}`);

  // Shopify Translate & Adapt already provides the correct localized handle in the URL
  // So we use params.handle directly with the appropriate language context
  const product = await getProduct(params.handle, {
    language: params.locale === "ar" ? "ar" : "en",
    country: "AE",
  });

  if (!product) return notFound();

  const { url, width, height, altText: alt } = product.featuredImage || {};
  const indexable = !product.tags.includes(HIDDEN_PRODUCT_TAG);

  // Use localized content for metadata
  const title = getLocalizedProductTitle(product, params.locale as "en" | "ar");
  const description = getLocalizedProductDescription(
    product,
    params.locale as "en" | "ar"
  );

  return {
    title: product.seo.title || `${title} | ATP Trading`,
    description: product.seo.description || generateMetaDescription(product, params.locale as "en" | "ar"),
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable,
      },
    },
    alternates: {
      languages: await getProductLanguageLinks(product.id),
      canonical: `https://www.atpgroupservices.ae/${params.locale}/product/${params.handle}`,
    },
    openGraph: url
      ? {
          title: product.seo.title || title,
          description: product.seo.description || generateMetaDescription(product, params.locale as "en" | "ar"),
          url: `https://www.atpgroupservices.ae/${params.locale}/product/${params.handle}`,
          type: 'website',
          images: [
            {
              url,
              width,
              height,
              alt: alt || title,
            },
          ],
        }
      : null,
  };
}

export default async function ProductPage(props: {
  params: Promise<{ handle: string; locale: string }>;
}) {
  const params = await props.params;
  if (isEmsPromotion(params.handle)) return <InactiveServicePage locale={params.locale} />;

  // Shopify Translate & Adapt already provides the correct localized handle in the URL
  // So we use params.handle directly with the appropriate language context
  const product = await getProduct(params.handle, {
    language: params.locale === "ar" ? "ar" : "en",
    country: "AE",
  });

  if (!product) return notFound();

  // Get localized product title for use in schema and alt text
  const localizedTitle = getLocalizedProductTitle(product, params.locale as "en" | "ar");
  const localizedDescription = getLocalizedProductDescription(product, params.locale as "en" | "ar");

  // Prepare structured data for SEO
  const productSchemaData = {
    name: localizedTitle,
    description: localizedDescription,
    image: product.images.map((img: Image) => img.url),
    url: `https://www.atpgroupservices.ae/${params.locale}/product/${params.handle}`,
    price: product.priceRange.minVariantPrice.amount,
    priceCurrency: product.priceRange.minVariantPrice.currencyCode,
    availability: product.availableForSale ? "InStock" as const : "OutOfStock" as const,
    isMembership: product.handle === "atp-membership",
    // Omit unverified manufacturer brands rather than labeling the reseller as the brand.
    brand: product.handle === "atp-membership" ? "ATP Trading" : undefined,
  };

  const breadcrumbItems = [
    {
      name: params.locale === "ar" ? "الرئيسية" : "Home",
      url: `https://www.atpgroupservices.ae/${params.locale}`
    },
    {
      name: params.locale === "ar" ? "المنتجات" : "Products",
      url: `https://www.atpgroupservices.ae/${params.locale}/search`
    },
    {
      name: localizedTitle,
      url: productSchemaData.url
    }
  ];

  return (
    <ProductProvider>
      <ProductAnalytics item={{ item_id: product.id, item_name: product.title, price: Number(product.priceRange.minVariantPrice.amount), quantity: 1 }} currency={product.priceRange.minVariantPrice.currencyCode} />
      <ProductStructuredData {...productSchemaData} />
      <BreadcrumbStructuredData items={breadcrumbItems} />
      <div className="mx-auto max-w-(--breakpoint-2xl) px-4" dir="ltr">
        <div className="flex flex-col rounded-lg border border-atp-light-gray bg-atp-white p-8 md:p-12 lg:flex-row lg:gap-8">
          <div className="h-full w-full basis-full lg:basis-4/6">
            <Suspense
              fallback={
                <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden" />
              }
            >
              <ATPLuxuryGallery
                images={product.images.slice(0, 5).map((image: Image, index: number) => ({
                  src: image.url,
                  altText: getImageAlt(image.altText, localizedTitle, index),
                }))}
                productTitle={localizedTitle}
                enableZoom={true}
                enableLightbox={true}
                enableSwipe={true}
              />
            </Suspense>
          </div>

          <div className="basis-full lg:basis-2/6" dir={params.locale === 'ar' ? 'rtl' : 'ltr'}>
            <Suspense fallback={null}>
              <ATPProductDescription
                product={product}
                locale={params.locale as "en" | "ar"}
              />
            </Suspense>
          </div>
        </div>
        <Suspense
          fallback={
            <div className="py-16 bg-gradient-to-b from-gray-50/50 to-white">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="animate-pulse space-y-8">
                  <div className="h-8 bg-gray-200 rounded-md w-64"></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-gray-200 aspect-square rounded-2xl"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          }
        >
          <RelatedProducts
            id={product.id}
            locale={params.locale as "en" | "ar"}
            collectionHandle={product.collections?.edges?.[0]?.node?.handle}
          />
        </Suspense>
      </div>
    </ProductProvider>
  );
}

async function RelatedProducts({
  id,
  locale,
  collectionHandle,
}: {
  id: string;
  locale: "en" | "ar";
  collectionHandle?: string;
}) {
  const relatedProducts = await getProductRecommendations(id, {
    language: locale === "ar" ? "ar" : "en",
    country: "AE",
  });

  if (!relatedProducts.length) return null;

  return <EnhancedRelatedProducts products={relatedProducts} locale={locale} collectionHandle={collectionHandle} />;
}
