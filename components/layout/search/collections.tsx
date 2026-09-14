import { getCollections } from "@/lib/shopify/server"
import CollectionsClient from "./collections-client"

export default async function Collections({ locale = "en" }: { locale?: string }) {
  const collections = await getCollections({ language: locale === "ar" ? "AR" : "EN", country: "AE" })
  
  return <CollectionsClient collections={collections} />
}