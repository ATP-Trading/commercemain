import { getProducts } from "@/lib/shopify/server";
import { defaultSort, sorting } from "@/lib/constants";
import { matchesLocalizedTitle } from "@/lib/localized-search";
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
  let products = await getProducts({
    sortKey,
    reverse,
    query: searchQuery,
    locale: {
      language: params.locale === "ar" ? "ar" : "en",
      country: "AE",
    },
  });

  // Shopify may not match translated titles. Use the localized catalog for an
  // Arabic title fallback when the provider returns no matches (current catalog <100).
  if (params.locale === "ar" && searchQuery && products.length === 0 && /\p{Script=Arabic}/u.test(searchQuery)) {
    const catalog = await getProducts({ sortKey, reverse, locale: { language: "AR", country: "AE" } });
    products = catalog.filter(product => matchesLocalizedTitle(product, searchQuery, "ar"));
  }

  return (
    <SearchResults
      products={products}
      searchQuery={searchQuery || ""}
      sortValue={sort || ""}
      locale={params.locale as "en" | "ar"}
    />
  );
}
