import type { Product } from "@/lib/shopify/types";

export const collectionCategories = [
  { value: "supplements", en: "Supplements", ar: "مكملات غذائية" },
  { value: "beauty", en: "Beauty & personal care", ar: "عناية وتجميل" },
  { value: "drinks", en: "Coffee & drinks", ar: "قهوة ومشروبات" },
  { value: "water", en: "Water filters", ar: "فلاتر المياه" },
  { value: "soil", en: "Soil & plant care", ar: "العناية بالتربة والنباتات" },
] as const;
export type CollectionCategory = typeof collectionCategories[number]["value"];
// Verified catalog IDs: classifications are independent of translated titles/handles.
// New products can be assigned in Shopify using category:<value> tags.
const catalog: Record<CollectionCategory, string[]> = {
 supplements: ["8757286961390","8757287583982","8757288206574","8877054492910","8906627154158","8942547402990","8956847718638","8958618370286","9130449305838"],
 beauty: ["8757286273262","8757288796398","8798539579630","8798540562670","8798542561518","8853470183662","8877077463278","8877077856494","9155514761454","9155624829166","9155861643502","9155897852142","9509231755502","9509255545070"],
 drinks: ["8801824309486","8802541732078","8906884874478"],
 water: ["8900200628462","8904560836846"],
 soil: ["8901190418670","8901214503150","8909710131438"],
};
export function productCategory(product: Pick<Product, "id" | "tags">): CollectionCategory | undefined {
 const tagged = collectionCategories.find(category => product.tags?.includes(`category:${category.value}`));
 if (tagged) return tagged.value;
 return collectionCategories.find(category => catalog[category.value].includes(product.id.split("/").pop() || ""))?.value;
}
export function filterCollectionProducts(products: Product[], category: string | undefined) {
 const categories = collectionCategories.filter(option => products.some(product => productCategory(product) === option.value));
 const selected = categories.some(option => option.value === category) ? category : undefined;
 return { categories, products: selected ? products.filter(product => productCategory(product) === selected) : products };
}
