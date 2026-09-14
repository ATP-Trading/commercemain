/**
 * Enhanced Structured Data Component
 * 
 * Comprehensive Schema.org markup for ATP Trading
 * Supports Product, FAQ, Review, LocalBusiness, Breadcrumb, Organization, and more
 * 
 * Following Google's structured data guidelines for rich results
 */

// Define allowed Schema.org types for better type safety
type SchemaOrgType =
  | "Organization"
  | "Product"
  | "WebSite"
  | "BreadcrumbList"
  | "CollectionPage"
  | "ItemList"
  | "Article"
  | "BlogPosting"
  | "FAQPage"
  | "ContactPage"
  | "LocalBusiness"
  | "Review"
  | "AggregateRating"
  | "Offer"
  | "SearchAction";

interface StructuredDataProps {
  type: SchemaOrgType;
  data: Record<string, unknown>;
}

// ATP Trading Company Information
const ATP_COMPANY = {
  name: "ATP Trading",
  url: "https://www.atpgroupservices.ae",
  logo: "https://www.atpgroupservices.ae/images/atp-logo.png",
  image: "https://www.atpgroupservices.ae/images/atp-logo.png",
  description: "Skincare, supplements, and water and soil technology products in the UAE.",
  areaServed: ["AE"],
};

export function StructuredData({ type, data }: StructuredDataProps) {
  const generateSchema = () => {
    const baseSchema = {
      "@context": "https://schema.org",
      "@type": type,
      ...data,
    };

    // Handle specific schema types with custom logic
    switch (type) {
      case "Organization":
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": `${ATP_COMPANY.url}/#organization`,
          name: ATP_COMPANY.name,

          url: ATP_COMPANY.url,
          logo: {
            "@type": "ImageObject",
            url: ATP_COMPANY.logo,
            width: "512",
            height: "512",
          },
          image: ATP_COMPANY.image,
          description: ATP_COMPANY.description,

          contactPoint: {
            "@type": "ContactPoint",

            contactType: "customer service",

            availableLanguage: ["en", "ar"],
            areaServed: ATP_COMPANY.areaServed,
          },


          ...data,
        };

      case "LocalBusiness":
        return {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": `${ATP_COMPANY.url}/#localbusiness`,
          name: ATP_COMPANY.name,
          image: ATP_COMPANY.image,
          url: ATP_COMPANY.url,

          ...data,
        };

      case "WebSite":
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": `${ATP_COMPANY.url}/#website`,
          name: ATP_COMPANY.name,
          url: ATP_COMPANY.url,
          description: ATP_COMPANY.description,
          publisher: {
            "@id": `${ATP_COMPANY.url}/#organization`,
          },
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${ATP_COMPANY.url}/search?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
          inLanguage: ["en", "ar"],
          ...data,
        };

      case "Product":
        return {
          "@context": "https://schema.org",
          "@type": "Product",
          brand: {
            "@type": "Brand",
            name: data.brandName || ATP_COMPANY.name,
          },
          seller: {
            "@type": "Organization",
            name: ATP_COMPANY.name,
            url: ATP_COMPANY.url,
          },
          manufacturer: {
            "@type": "Organization",
            name: data.manufacturer || ATP_COMPANY.name,
          },
          ...data,
          // Ensure offers are properly formatted
          offers: data.offers
            ? {
                "@type": "Offer",
                priceCurrency: (data.offers as Record<string, unknown>).priceCurrency || "AED",
                availability: (data.offers as Record<string, unknown>).availability || "https://schema.org/InStock",
                seller: {
                  "@type": "Organization",
                  name: ATP_COMPANY.name,
                },
                shippingDetails: {
                  "@type": "OfferShippingDetails",
                  shippingDestination: {
                    "@type": "DefinedRegion",
                    addressCountry: "AE",
                  },
                  deliveryTime: {
                    "@type": "ShippingDeliveryTime",
                    handlingTime: {
                      "@type": "QuantitativeValue",
                      minValue: 1,
                      maxValue: 2,
                      unitCode: "d",
                    },
                    transitTime: {
                      "@type": "QuantitativeValue",
                      minValue: 1,
                      maxValue: 3,
                      unitCode: "d",
                    },
                  },
                },
                hasMerchantReturnPolicy: {
                  "@type": "MerchantReturnPolicy",
                  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
                  merchantReturnDays: 14,
                  returnMethod: "https://schema.org/ReturnByMail",
                  returnFees: "https://schema.org/FreeReturn",
                },
                ...(data.offers as Record<string, unknown>),
              }
            : undefined,
        };

      case "CollectionPage":
        return {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: data.name,
          description: data.description,
          url: data.url,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: (data.products as Array<Record<string, unknown>>) || [],
          },
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: ATP_COMPANY.url,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: data.name || "Collection",
                item: data.url || ATP_COMPANY.url,
              },
            ],
          },
          ...data,
        };

      case "BreadcrumbList":
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: (data.items as Array<{ name: string; url: string }>)?.map(
            (item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: item.name,
              item: item.url,
            })
          ) || [],
        };

      case "FAQPage":
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: (data.questions as Array<{ question: string; answer: string }>)?.map(
            (faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })
          ) || [],
        };

      case "Review":
        return {
          "@context": "https://schema.org",
          "@type": "Review",
          author: {
            "@type": "Person",
            name: data.authorName,
          },
          datePublished: data.datePublished,
          reviewRating: {
            "@type": "Rating",
            ratingValue: data.ratingValue,
            bestRating: "5",
            worstRating: "1",
          },
          reviewBody: data.reviewBody,
          itemReviewed: {
            "@type": "Product",
            name: data.productName,
            url: data.productUrl,
          },
          ...data,
        };

      case "AggregateRating":
        return {
          "@context": "https://schema.org",
          "@type": "AggregateRating",
          ratingValue: data.ratingValue,
          reviewCount: data.reviewCount,
          bestRating: "5",
          worstRating: "1",
          ...data,
        };

      case "Article":
      case "BlogPosting":
        return {
          "@context": "https://schema.org",
          "@type": type,
          headline: data.headline,
          description: data.description,
          image: data.image,
          datePublished: data.datePublished,
          dateModified: data.dateModified || data.datePublished,
          author: {
            "@type": "Person",
            name: data.authorName || "ATP Trading",
            url: data.authorUrl || ATP_COMPANY.url,
          },
          publisher: {
            "@type": "Organization",
            name: ATP_COMPANY.name,
            logo: {
              "@type": "ImageObject",
              url: ATP_COMPANY.logo,
            },
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": data.url,
          },
          ...data,
        };

      default:
        return baseSchema;
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateSchema()).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/**
 * Combined Schema for pages that need multiple schema types
 * Uses @graph to combine multiple schemas
 */
interface CombinedSchemaProps {
  schemas: Array<{ type: SchemaOrgType; data: Record<string, unknown> }>;
}

export function CombinedStructuredData({ schemas }: CombinedSchemaProps) {
  const generateCombinedSchema = () => {
    const graphItems = schemas.map(({ type, data }) => {
      // Reuse the generateSchema logic by calling StructuredData internally
      const baseSchema = {
        "@type": type,
        ...data,
      };
      return baseSchema;
    });

    return {
      "@context": "https://schema.org",
      "@graph": graphItems,
    };
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateCombinedSchema()).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/**
 * Product Schema Helper
 * Generates complete Product schema from Shopify product data
 */
interface ProductSchemaData {
  name: string;
  description: string;
  image: string | string[];
  sku?: string;
  url: string;
  price: string;
  priceCurrency: string;
  availability: "InStock" | "OutOfStock" | "PreOrder" | "Discontinued";
  condition?: "NewCondition" | "UsedCondition" | "RefurbishedCondition";
  brand?: string;
  manufacturer?: string;
  rating?: number;
  reviewCount?: number;
  reviews?: Array<{
    author: string;
    datePublished: string;
    rating: number;
    body: string;
  }>;
}

export function ProductStructuredData(product: ProductSchemaData) {
  const availabilityMap = {
    InStock: "https://schema.org/InStock",
    OutOfStock: "https://schema.org/OutOfStock",
    PreOrder: "https://schema.org/PreOrder",
    Discontinued: "https://schema.org/Discontinued",
  };

  const conditionMap = {
    NewCondition: "https://schema.org/NewCondition",
    UsedCondition: "https://schema.org/UsedCondition",
    RefurbishedCondition: "https://schema.org/RefurbishedCondition",
  };

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    url: product.url,
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    offers: {
      "@type": "Offer",
      url: product.url,
      price: product.price,
      priceCurrency: product.priceCurrency,
      availability: availabilityMap[product.availability],
      itemCondition: conditionMap[product.condition || "NewCondition"],
      seller: {
        "@type": "Organization",
        name: ATP_COMPANY.name,
      },
    },
  };

  // Add aggregate rating if available
  if (product.rating && product.reviewCount && product.reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating.toFixed(1),
      reviewCount: product.reviewCount,
      bestRating: "5",
      worstRating: "1",
    };
  }

  // Add individual reviews if available
  if (product.reviews && product.reviews.length > 0) {
    schema.review = product.reviews.slice(0, 5).map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.author,
      },
      datePublished: review.datePublished,
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating.toString(),
        bestRating: "5",
        worstRating: "1",
      },
      reviewBody: review.body,
    }));
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/**
 * Breadcrumb Schema Helper
 */
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbStructuredData({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/**
 * FAQ Schema Helper
 */
interface FAQItem {
  question: string;
  answer: string;
}

export function FAQStructuredData({ questions }: { questions: FAQItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/**
 * LocalBusiness Schema Helper for UAE presence
 * Pre-configured with ATP Trading UAE data
 */
interface LocalBusinessSchemaData {
  additionalType?: string;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
  hasOfferCatalog?: {
    name: string;
    itemListElement: Array<{
      name: string;
      description: string;
    }>;
  };
}

export function LocalBusinessStructuredData(data?: LocalBusinessSchemaData) {
  const schema = {
    "@context": "https://schema.org",
    "@type": data?.additionalType || "HealthAndBeautyBusiness",
    "@id": `${ATP_COMPANY.url}/#localbusiness`,
    name: ATP_COMPANY.name,
    image: ATP_COMPANY.image,
    url: ATP_COMPANY.url,


    description: ATP_COMPANY.description,





    areaServed: ATP_COMPANY.areaServed.map((code) => ({
      "@type": "Country",
      name: code,
    })),

    ...(data?.aggregateRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: data.aggregateRating.ratingValue,
        reviewCount: data.aggregateRating.reviewCount,
        bestRating: "5",
        worstRating: "1",
      },
    }),
    ...(data?.hasOfferCatalog && {
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: data.hasOfferCatalog.name,
        itemListElement: data.hasOfferCatalog.itemListElement.map((item) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: item.name,
            description: item.description,
          },
        })),
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/**
 * Product FAQ Schema - combines Product and FAQ for product pages
 */
interface ProductFAQItem {
  question: string;
  answer: string;
}

interface ProductFAQSchemaData {
  productName: string;
  productUrl: string;
  questions: ProductFAQItem[];
}

export function ProductFAQStructuredData({ productName, productUrl, questions }: ProductFAQSchemaData) {
  if (!questions || questions.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    name: `Frequently Asked Questions about ${productName}`,
    url: productUrl,
    mainEntity: questions.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}
