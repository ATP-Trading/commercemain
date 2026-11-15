import { getCollectionProducts, getFeaturedProducts } from "@/lib/shopify/server"
import { NewArrivalsCarousel } from "./new-arrivals-carousel"
import { type Locale } from "@/lib/i18n/config"

interface NewArrivalsWrapperProps {
  locale: Locale
}

export async function NewArrivalsWrapper({ locale }: NewArrivalsWrapperProps) {
  // Convert locale string to Shopify API format for @inContext directive
  // This enables translated product titles, descriptions, and other content
  const localeForApi = locale === 'ar' 
    ? { language: 'AR', country: 'AE' }
    : { language: 'EN', country: 'AE' };

  const featuredProducts = await getFeaturedProducts({
    collection: "featured-products",
    limit: 6,
    locale: localeForApi,
  });

  // Fallback to amazing-thai-products if featured-products collection is empty
  const products = featuredProducts?.length 
    ? featuredProducts 
    : await getCollectionProducts({ collection: "amazing-thai-products", locale: localeForApi })

  if (!products?.length) return null

  return <NewArrivalsCarousel products={products.slice(0, 6)} locale={locale} />
}
