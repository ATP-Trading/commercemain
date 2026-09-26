import { filterCollectionProducts } from "@/lib/collection-categories";
import { InactiveServicePage, inactiveServiceMetadata } from "@/components/inactive-service-page";
import { isEmsPromotion } from "@/lib/publication-policy";
import { getCollection, getCollectionProducts } from "@/lib/shopify/server";
import { defaultSort, sorting } from "@/lib/constants";
import CollectionResults from "./collection-results";

export default async function CategoryPage(props: {
  params: Promise<{ collection: string; locale: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await the params and searchParams
  const searchParams = (await props.searchParams) || {};
  const params = await props.params;
  if (isEmsPromotion(params.collection)) return <InactiveServicePage locale={params.locale} />;
  
  const { sort } = searchParams as { [key: string]: string };
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;

  // Parse locale for Shopify API
  const localeForApi = params.locale === 'ar' 
    ? { language: 'AR', country: 'AE' }
    : { language: 'EN', country: 'AE' };

  // Fetch data on the server with locale
  const [products, collection] = await Promise.all([
    getCollectionProducts({
      collection: params.collection,
      sortKey,
      reverse,
      locale: localeForApi,
    }),
    getCollection(params.collection, localeForApi),
  ]);

  const filtered = filterCollectionProducts(products, typeof searchParams.category === "string" ? searchParams.category : undefined);

  return (
    <CollectionResults 
      products={filtered.products}
      categories={filtered.categories}
      collection={collection}
      locale={params.locale as "en" | "ar"}
    />
  );
}