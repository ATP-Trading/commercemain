import type { Product } from "./types";

type ProductContentField = "title" | "description" | "descriptionHtml";
type LocalizedProductContent = Partial<Pick<Product, ProductContentField | "translations" | "titleAr" | "descriptionAr" | "descriptionHtmlAr">>;

// Fragment for multilingual product data
export const MULTILINGUAL_PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment MultilingualProduct on Product {
    id
    handle
    title
    description
    descriptionHtml
    
    # Arabic content metafields
    titleAr: metafield(namespace: "i18n", key: "title_ar") {
      value
    }
    descriptionAr: metafield(namespace: "i18n", key: "description_ar") {
      value
    }
    descriptionHtmlAr: metafield(namespace: "i18n", key: "description_html_ar") {
      value
    }
    
    # Category translations
    categoryAr: metafield(namespace: "i18n", key: "category_ar") {
      value
    }
    
    # Product features in Arabic
    featuresAr: metafield(namespace: "i18n", key: "features_ar") {
      value
    }
    
    # Ingredients/specifications in Arabic
    ingredientsAr: metafield(namespace: "i18n", key: "ingredients_ar") {
      value
    }
    technicalSpecsAr: metafield(namespace: "i18n", key: "technical_specs_ar") {
      value
    }
    
    # Usage instructions in Arabic
    usageInstructionsAr: metafield(namespace: "i18n", key: "usage_instructions_ar") {
      value
    }
    
    # Benefits in Arabic
    benefitsAr: metafield(namespace: "i18n", key: "benefits_ar") {
      value
    }
    
    # SEO metafields for Arabic
    seoTitleAr: metafield(namespace: "seo", key: "title_ar") {
      value
    }
    seoDescriptionAr: metafield(namespace: "seo", key: "description_ar") {
      value
    }
    
    # Product tags for Arabic
    tagsAr: metafield(namespace: "i18n", key: "tags_ar") {
      value
    }
  }
`

// Fragment for multilingual collection data
export const MULTILINGUAL_COLLECTION_FRAGMENT = /* GraphQL */ `
  fragment MultilingualCollection on Collection {
    id
    handle
    title
    description
    descriptionHtml
    
    # Arabic content metafields
    titleAr: metafield(namespace: "i18n", key: "title_ar") {
      value
    }
    descriptionAr: metafield(namespace: "i18n", key: "description_ar") {
      value
    }
    descriptionHtmlAr: metafield(namespace: "i18n", key: "description_html_ar") {
      value
    }
    
    # SEO metafields for Arabic
    seoTitleAr: metafield(namespace: "seo", key: "title_ar") {
      value
    }
    seoDescriptionAr: metafield(namespace: "seo", key: "description_ar") {
      value
    }
  }
`

// Query for getting products with multilingual content
export const GET_MULTILINGUAL_PRODUCTS = /* GraphQL */ `
  query GetMultilingualProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          ...MultilingualProduct
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                # Arabic variant title
                titleAr: metafield(namespace: "i18n", key: "title_ar") {
                  value
                }
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${MULTILINGUAL_PRODUCT_FRAGMENT}
`

// Query for getting a single product with multilingual content
export const GET_MULTILINGUAL_PRODUCT = /* GraphQL */ `
  query GetMultilingualProduct($handle: String!) {
    product(handle: $handle) {
      ...MultilingualProduct
      variants(first: 100) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
            quantityAvailable
            selectedOptions {
              name
              value
            }
            # Arabic variant data
            titleAr: metafield(namespace: "i18n", key: "title_ar") {
              value
            }
            selectedOptionsAr: metafield(namespace: "i18n", key: "selected_options_ar") {
              value
            }
          }
        }
      }
      options {
        id
        name
        values
        # Arabic option names and values
        nameAr: metafield(namespace: "i18n", key: "option_name_ar") {
          value
        }
        valuesAr: metafield(namespace: "i18n", key: "option_values_ar") {
          value
        }
      }
    }
  }
  ${MULTILINGUAL_PRODUCT_FRAGMENT}
`

// Query for getting collections with multilingual content
export const GET_MULTILINGUAL_COLLECTIONS = /* GraphQL */ `
  query GetMultilingualCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          ...MultilingualCollection
          products(first: 10) {
            edges {
              node {
                id
                handle
                title
                # Arabic product title for collection display
                titleAr: metafield(namespace: "i18n", key: "title_ar") {
                  value
                }
              }
            }
          }
        }
      }
    }
  }
  ${MULTILINGUAL_COLLECTION_FRAGMENT}
`

// Utility types for multilingual content
export interface MultilingualProduct {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml: string
  titleAr?: string
  descriptionAr?: string
  descriptionHtmlAr?: string
  categoryAr?: string
  featuresAr?: string
  ingredientsAr?: string
  technicalSpecsAr?: string
  usageInstructionsAr?: string
  benefitsAr?: string
  seoTitleAr?: string
  seoDescriptionAr?: string
  tagsAr?: string
}

export interface MultilingualCollection {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml: string
  titleAr?: string
  descriptionAr?: string
  descriptionHtmlAr?: string
  seoTitleAr?: string
  seoDescriptionAr?: string
}

// Helper function to get localized content
export function getLocalizedContent<T extends MultilingualProduct | MultilingualCollection>(
  item: T,
  locale: 'en' | 'ar',
  field: keyof T
): string {
  if (locale === 'ar') {
    const arabicField = `${String(field)}Ar` as keyof T
    const arabicValue = item[arabicField]
    if (arabicValue && typeof arabicValue === 'string') {
      return arabicValue
    }
  }

  const defaultValue = item[field]
  return typeof defaultValue === 'string' ? defaultValue : ''
}

// Helper function to get localized content from Shopify translations or metafields
export function getLocalizedProductContent(
  product: LocalizedProductContent,
  locale: 'en' | 'ar',
  field: 'title' | 'description' | 'descriptionHtml'
): string {
  if (locale === 'ar') {
    // First try native Shopify translations with locale check
    // This works with Shopify's Translate & Adapt app
    if (product.translations && Array.isArray(product.translations)) {
      // Try to find translation for Arabic locale
      const translation = product.translations.find(
        (t) => t.key === field && t.locale === 'ar'
      )
      if (translation?.value) {
        return translation.value
      }
      
      // Fallback: try without locale check (for older format)
      const fallbackTranslation = product.translations.find((t) => t.key === field)
      if (fallbackTranslation?.value) {
        return fallbackTranslation.value
      }
    }

    // Fallback to metafields (for manual translations)
    const metafieldKey = `${field}Ar` as `${ProductContentField}Ar`
    const metafield = product[metafieldKey]
    if (metafield?.value) {
      return metafield.value
    }
  }

  // Return default English content
  return product[field] || ''
}

// Helper function to get localized product title
export function getLocalizedProductTitle(product: LocalizedProductContent | null | undefined, locale: 'en' | 'ar'): string {
  // Defensive null check - return empty string if product is missing
  if (!product) {
    console.warn('[i18n] getLocalizedProductTitle called with null/undefined product');
    return '';
  }
  return getLocalizedProductContent(product, locale, 'title')
}

// Helper function to get localized product description
export function getLocalizedProductDescription(product: LocalizedProductContent, locale: 'en' | 'ar'): string {
  return getLocalizedProductContent(product, locale, 'description')
}

// Helper function to get localized product description HTML
export function getLocalizedProductDescriptionHtml(product: LocalizedProductContent, locale: 'en' | 'ar'): string {
  return getLocalizedProductContent(product, locale, 'descriptionHtml')
}

// Helper function to get localized collection title
export function getLocalizedCollectionTitle(collection: MultilingualCollection, locale: 'en' | 'ar'): string {
  return getLocalizedContent(collection, locale, 'title')
}

// Helper function to parse Arabic tags
export function getLocalizedTags(product: MultilingualProduct, locale: 'en' | 'ar'): string[] {
  if (locale === 'ar' && product.tagsAr) {
    try {
      return JSON.parse(product.tagsAr)
    } catch {
      return product.tagsAr.split(',').map(tag => tag.trim())
    }
  }

  // Fallback to default tags (would need to be added to the fragment)
  return []
}

// Helper function to parse Arabic features/ingredients
export function getLocalizedList(product: MultilingualProduct, locale: 'en' | 'ar', type: 'features' | 'ingredients'): string[] {
  const field = locale === 'ar' ? `${type}Ar` : type
  const value = product[field as keyof MultilingualProduct]

  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return value.split('\n').filter(item => item.trim())
    }
  }

  return []
}

// Helper function to get localized handle
// IMPORTANT: Shopify's Storefront API with @inContext does NOT automatically translate handles.
// Handle translations must be manually registered via Admin API's TranslationsRegister mutation.
// Since product URLs should remain consistent across locales (the content is what changes),
// we ALWAYS return the original English handle. The @inContext directive handles content translation.
// 
// Why this matters:
// - URL: /ar/product/advanced-damage-hair-shampoo (same handle for all locales)
// - Content: Title, description, etc. are translated via @inContext(language: AR)
// - This ensures product links work correctly regardless of locale
export function getLocalizedProductHandle(product: Pick<Product, "handle">, locale: 'en' | 'ar'): string {
  // Always return the original handle - URLs should be consistent across locales
  // The @inContext directive handles content translation, not URL translation
  return product.handle;
}
