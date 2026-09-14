import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProducts } from "@/lib/shopify/server";
import { CategoryData, FAQ, UAECities, LocationServices } from "./data";
import { Product } from "@/lib/shopify/types";

// Generate metadata for category pages
export function generateCategoryMetadata(slug: string, locale: string): Metadata {
  const category = CategoryData[slug];
  if (!category) return {};

  const isAr = locale === "ar";
  const title = isAr ? `${category.nameAr} | ATP Trading` : category.metaTitle;
  const description = isAr ? category.descriptionAr : category.metaDescription;
  const url = `https://www.atpgroupservices.ae/${locale}/category/${slug}`;

  return {
    title: { absolute: title.includes("ATP Trading") ? title : `${title} | ATP Trading` },
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `https://www.atpgroupservices.ae/en/category/${slug}`,
        ar: `https://www.atpgroupservices.ae/ar/category/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [
        {
          url: category.image,
          width: 1200,
          height: 630,
          alt: category.name,
        },
      ],
    },
  };
}

// Generate metadata for location pages
export function generateLocationMetadata(
  service: string,
  city: string,
  locale: string
): Metadata {
  const serviceData = LocationServices.find((s) => s.slug === service);
  const cityData = UAECities.find((c) => c.slug === city);

  if (!serviceData || !cityData) return {};

  const isAr = locale === "ar";
  const title = isAr
    ? `${serviceData.nameAr} في ${cityData.nameAr} | ATP Trading`
    : `${serviceData.name} in ${cityData.name} | ATP Trading`;
  const description = isAr
    ? `تصفح ${serviceData.nameAr} وراجع معلومات المنتجات والتوصيل إلى ${cityData.nameAr} مع ATP Trading.`
    : `Browse ${serviceData.name} and review product details and delivery to ${cityData.name} with ATP Trading.`;
  const url = `https://www.atpgroupservices.ae/${locale}/${service}/${city}`;

  return {
    title: { absolute: title.includes("ATP Trading") ? title : `${title} | ATP Trading` },
    description,
    robots: { index: false, follow: true },
    alternates: {
      canonical: url,
      languages: {
        en: `https://www.atpgroupservices.ae/en/${service}/${city}`,
        ar: `https://www.atpgroupservices.ae/ar/${service}/${city}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
    },
  };
}

// Fetch products for a category
export async function getCategoryProducts(
  productHandles: string[],
  locale: string
): Promise<Product[]> {
  try {
    const allProducts = await getProducts({
      locale: { language: locale === "ar" ? "AR" : "EN", country: "AE" },
    });

    return allProducts.filter((product) =>
      productHandles.includes(product.handle)
    );
  } catch (error) {
    console.error("Error fetching category products:", error);
    return [];
  }
}

// Generate JSON-LD structured data for category pages
export function generateCategoryStructuredData(
  category: typeof CategoryData[string],
  products: Product[],
  locale: string
) {
  const isAr = locale === "ar";
  const url = `https://www.atpgroupservices.ae/${locale}/category/${category.slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": url,
        name: isAr ? category.nameAr : category.name,
        description: isAr ? category.descriptionAr : category.description,
        url,
        mainEntity: {
          "@type": "ItemList",
          itemListElement: products.map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Product",
              name: product.title,
              url: `https://www.atpgroupservices.ae/${locale}/product/${product.handle}`,
              image: product.featuredImage?.url,
              offers: {
                "@type": "Offer",
                price: product.priceRange.minVariantPrice.amount,
                priceCurrency: product.priceRange.minVariantPrice.currencyCode,
                availability: product.availableForSale
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
              },
            },
          })),
        },
        breadcrumb: {
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
              name: isAr ? "الفئات" : "Categories",
              item: `https://www.atpgroupservices.ae/${locale}/search`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: isAr ? category.nameAr : category.name,
              item: url,
            },
          ],
        },
      },
      // FAQ Page schema if FAQs exist
      category.faqs && category.faqs.length > 0
        ? {
            "@type": "FAQPage",
            mainEntity: (isAr ? category.faqsAr : category.faqs).map(
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

// Generate JSON-LD for location pages
export function generateLocationStructuredData(
  service: string,
  city: string,
  products: Product[],
  locale: string
) {
  const serviceData = LocationServices.find((s) => s.slug === service);
  const cityData = UAECities.find((c) => c.slug === city);

  if (!serviceData || !cityData) return null;

  const isAr = locale === "ar";
  const url = `https://www.atpgroupservices.ae/${locale}/${service}/${city}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}/#collection`,
        name: `ATP Trading - ${isAr ? serviceData.nameAr : serviceData.name}`,
        description: `${isAr ? serviceData.nameAr : serviceData.name} in ${isAr ? cityData.nameAr : cityData.name}`,
        url,
        areaServed: {
          "@type": "City",
          name: cityData.name,
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: isAr ? serviceData.nameAr : serviceData.name,
          itemListElement: products.map((product) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Product",
              name: product.title,
              url: `https://www.atpgroupservices.ae/${locale}/product/${product.handle}`,
            },
          })),
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
            name: isAr ? "الخدمات" : "Services",
            item: `https://www.atpgroupservices.ae/${locale}/search`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: isAr ? serviceData.nameAr : serviceData.name,
            item: `https://www.atpgroupservices.ae/${locale}/collections/${serviceData.collection}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: isAr ? cityData.nameAr : cityData.name,
            item: url,
          },
        ],
      },
    ],
  };
}
