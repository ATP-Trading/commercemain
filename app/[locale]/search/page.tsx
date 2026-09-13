import { getProducts } from "@/lib/shopify/server";
import { defaultSort, sorting } from "@/lib/constants";
import SearchResults from "./search-results";

// Force dynamic rendering - this page uses no-store fetch for fresh Shopify data
export const dynamic = 'force-dynamic';

export default async function SearchPage(props: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await the params and searchParams
  const searchParams = (await props.searchParams) || {};
  const params = await props.params;

  const { sort, q: searchQuery } = searchParams as {
    [key: string]: string;
  };

  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;

  // Fetch products on the server
  const products = await getProducts({
    sortKey,
    reverse,
    query: searchQuery,
    locale: {
      language: params.locale === "ar" ? "ar" : "en",
      country: "AE",
    },
  });

  return (
    <SearchResults
      products={products}
      searchQuery={searchQuery || ""}
      sortValue={sort || ""}
      locale={params.locale as "en" | "ar"}
    />
  );
}
