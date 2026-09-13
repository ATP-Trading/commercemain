import { getSiteUrl } from "./site-url";

// Server-side configuration
export const config = {
  baseUrl: getSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  shopify: {
    domain: process.env.SHOPIFY_STORE_DOMAIN || 'hydrogen-preview.myshopify.com',
    accessToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '3b580e70970c4528da70c98e097c2fa0',
    apiVersion: process.env.SHOPIFY_API_VERSION || '2026-01',
    customerAccountAccessToken: process.env.SHOPIFY_CUSTOMER_ACCOUNT_ACCESS_TOKEN,
  },
  revalidation: {
    secret: process.env.SHOPIFY_REVALIDATION_SECRET,
  },
  analytics: {
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
    shopifyAnalytics: process.env.SHOPIFY_ANALYTICS_ENABLED === 'true',
  },
  features: {
    customerAccounts: process.env.ENABLE_CUSTOMER_ACCOUNTS === 'true',
    subscriptions: process.env.ENABLE_SUBSCRIPTIONS === 'true',
    predictiveSearch: process.env.ENABLE_PREDICTIVE_SEARCH === 'true',
    advancedFilters: process.env.ENABLE_ADVANCED_FILTERS === 'true',
  },
  cache: {
    products: process.env.CACHE_PRODUCTS === 'true',
    collections: process.env.CACHE_COLLECTIONS === 'true',
    cart: process.env.CACHE_CART === 'true',
  }
} as const

// Validate required environment variables
export function validateEnvironmentVariables() {
  const required = [
    'SHOPIFY_STORE_DOMAIN',
    'SHOPIFY_STOREFRONT_ACCESS_TOKEN',
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.warn(`⚠️  Missing required environment variables: ${missing.join(', ')}`)
    console.warn('🚀 Using Shopify demo store for development. Please set up your .env.local file.')
    console.warn('📝 Create .env.local with your store credentials when ready for production.')
    return false
  }

  // Validate store domain format
  const domain = config.shopify.domain
  if (!domain.includes('.myshopify.com') && !domain.includes('hydrogen-preview.myshopify.com')) {
    console.warn(`⚠️  Invalid store domain format: ${domain}`)
    console.warn('📝 Domain should be: your-store.myshopify.com')
    return false
  }

  console.log(`✅ Connected to Shopify store: ${domain}`)
  return true
}

// Feature flags
export const features = {
  customerAccounts: config.features.customerAccounts,
  subscriptions: config.features.subscriptions,
  predictiveSearch: config.features.predictiveSearch,
  advancedFilters: config.features.advancedFilters,
} as const
