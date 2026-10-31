import { canonicalCollectionHandle } from "./collection-handle";
import { isInactiveCollection } from "./publication-policy";

type CollectionLink = { handle: string; title: string };
const labels: Record<string, [string, string]> = {
  "amazing-thai-products": ["Health & Beauty", "الصحة والجمال"],
  "water-soil-technology-solutions": ["Water & Soil Technology", "تكنولوجيا المياه والتربة"],
  "atp-special-packages": ["Special Packages", "الباقات الخاصة"],
  "featured-products": ["Featured Products", "منتجات مميزة"],
  "frontpage": ["Home Collection", "مختارات الرئيسية"],
};

export function collectionNavigation(collections: CollectionLink[], locale: string) {
  const seen = new Set<string>();
  return collections.flatMap((collection) => {
    const handle = canonicalCollectionHandle(collection.handle);
    if (!handle || handle.startsWith("hidden") || isInactiveCollection(handle) || seen.has(handle)) return [];
    seen.add(handle);
    return [{ handle, title: labels[handle]?.[locale === "ar" ? 1 : 0] || collection.title,
      href: `/${locale}/collections/${encodeURIComponent(handle)}` }];
  }).sort((a, b) => {
    const order = Object.keys(labels);
    const rank = (handle: string) => order.includes(handle) ? order.indexOf(handle) : order.length;
    return rank(a.handle) - rank(b.handle);
  });
}
