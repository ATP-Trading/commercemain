import { isEmsPromotion, isInactiveLocation } from "@/lib/publication-policy"
import { getCollections, getPages, getProducts } from "@/lib/shopify/server"
import { baseUrl, validateEnvironmentVariables } from "@/lib/utils"
import { CategoryData, UAECities, LocationServices, BenefitData, IngredientData } from "@/lib/programmatic-seo/data"
import { ComparisonData } from "@/lib/programmatic-seo/comparison-data"
import type { MetadataRoute } from "next"

type Route = {
  url: string
  lastModified: string
}

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  validateEnvironmentVariables()

  const routesMap = [""].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
  }))

  const collectionsPromise = getCollections().then((collections) =>
    collections.map((collection) => ({
      url: `${baseUrl}${collection.path}`,
      lastModified: collection.updatedAt,
    })),
  )

  const productsPromise = getProducts({
    locale: { language: 'en', country: 'AE' }
  }).then((products) =>
    products.map((product) => ({
      url: `${baseUrl}/product/${product.handle}`,
      lastModified: product.updatedAt,
    })),
  )

  const pagesPromise = getPages().then((pages) =>
    pages.map((page) => ({
      url: `${baseUrl}/${page.handle}`,
      lastModified: page.updatedAt,
    })),
  )

  // Programmatic SEO Pages
  const lastModified = new Date().toISOString()
  
  // Category Pages (5 categories)
  const categoryRoutes = Object.keys(CategoryData).filter((slug) => !isEmsPromotion(slug)).flatMap((slug) => [
    { url: `${baseUrl}/en/category/${slug}`, lastModified },
    { url: `${baseUrl}/ar/category/${slug}`, lastModified },
  ])

  // Location Pages (5 services × 8 cities = 40 pages per language)
  const locationRoutes = LocationServices.flatMap((service) =>
    UAECities.filter((city) => !isInactiveLocation(service.slug, city.slug)).flatMap((city) => [
      { url: `${baseUrl}/en/${service.slug}/${city.slug}`, lastModified },
      { url: `${baseUrl}/ar/${service.slug}/${city.slug}`, lastModified },
    ])
  )

  // Benefits Pages
  const benefitsRoutes = Object.keys(BenefitData).filter((slug) => !isEmsPromotion(slug)).flatMap((slug) => [
    { url: `${baseUrl}/en/benefits/${slug}`, lastModified },
    { url: `${baseUrl}/ar/benefits/${slug}`, lastModified },
  ])

  // Ingredients Pages
  const ingredientsRoutes = Object.keys(IngredientData).flatMap((slug) => [
    { url: `${baseUrl}/en/ingredients/${slug}`, lastModified },
    { url: `${baseUrl}/ar/ingredients/${slug}`, lastModified },
  ])

  // Comparison Pages
  const comparisonRoutes = Object.keys(ComparisonData).filter((slug) => !isEmsPromotion(slug)).flatMap((slug) => [
    { url: `${baseUrl}/en/compare/${slug}`, lastModified },
    { url: `${baseUrl}/ar/compare/${slug}`, lastModified },
  ])

  let fetchedRoutes: Route[] = []

  try {
    fetchedRoutes = (await Promise.all([collectionsPromise, productsPromise, pagesPromise])).flat()
  } catch (error) {
    throw JSON.stringify(error, null, 2)
  }

  const programmaticRoutes = [
    ...categoryRoutes,
    ...locationRoutes,
    ...benefitsRoutes,
    ...ingredientsRoutes,
    ...comparisonRoutes,
  ]

  return [...routesMap, ...fetchedRoutes, ...programmaticRoutes].filter((route) => !isEmsPromotion(route.url))
}
