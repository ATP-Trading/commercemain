import { getCollection } from "@/lib/shopify/server"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

export async function generateMetadata(props: {
  params: Promise<{ collection: string; locale: string }>
}): Promise<Metadata> {
  const params = await props.params
  
  // Parse locale for Shopify API
  const localeForApi = params.locale === 'ar' 
    ? { language: 'AR', country: 'AE' }
    : { language: 'EN', country: 'AE' };
  
  const collection = await getCollection(params.collection, localeForApi)

  if (!collection) return notFound()

  return {
    alternates: { canonical: `/${params.locale}/collections/${collection.handle}` },
    title: collection.seo?.title || collection.title,
    description: collection.seo?.description || collection.description || `${collection.title} products`,
  }
}

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
