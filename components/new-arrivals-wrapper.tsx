import { getCollectionProducts, getFeaturedProducts, getNewestProducts } from "@/lib/shopify/server"
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

  // Fetch featured products from the dedicated collection (limit: 5)
  // To customize: Go to Shopify Admin → Products → Collections → "Featured Products"
  // Add exactly 5 products you want to feature in your preferred order
  const [featuredProducts, carouselProducts] = await Promise.all([getFeaturedProducts({
    collection: "featured-products",
    limit: 5,
    locale: localeForApi,
  }), getNewestProducts({
    limit: 4,
    locale: localeForApi,
  })]);

  // Fallback to amazing-thai-products if featured-products collection is empty
  const products = featuredProducts?.length 
    ? featuredProducts 
    : await getCollectionProducts({ collection: "amazing-thai-products", locale: localeForApi })

  if (!products?.length) return null

  return <NewArrivalsCarousel products={products} carouselProducts={carouselProducts || []} locale={locale} />
}
