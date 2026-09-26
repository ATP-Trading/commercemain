"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function CollectionSort({ locale, categories = [] }: { locale: "en" | "ar"; categories?: readonly {value: string; en: string; ar: string}[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const ar = locale === "ar";
  const options = [
    { value: "", label: ar ? "الترتيب الافتراضي" : "Featured" },
    { value: "price-desc", label: ar ? "السعر: من الأغلى للأرخص" : "Price: High to low" },
    { value: "price-asc", label: ar ? "السعر: من الأرخص للأغلى" : "Price: Low to high" },
    { value: "trending-desc", label: ar ? "الأكثر مبيعًا" : "Best sellers" },
    { value: "latest-desc", label: ar ? "الأحدث" : "Newest arrivals" },
  ];
  const sort = searchParams.get("sort") || "";
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2" dir={ar ? "rtl" : "ltr"} aria-busy={pending}>
      {categories.length > 0 && <div className="flex min-w-0 flex-col gap-2"><label htmlFor="collection-category" className="text-start text-sm font-medium text-atp-black">{ar ? "الفئة" : "Category"}</label>
      <select id="collection-category" value={categories.some(c => c.value === searchParams.get("category")) ? searchParams.get("category")! : ""} disabled={pending}
        className="h-12 w-full min-w-0 rounded-lg border border-neutral-400 bg-white px-4 py-3 text-base text-neutral-900 focus:ring-2 focus:ring-atp-gold disabled:opacity-60"
        onChange={event => {
          const query = new URLSearchParams(searchParams.toString());
          if (event.target.value) query.set("category", event.target.value); else query.delete("category");
          query.delete("cursor"); query.delete("page");
          startTransition(() => router.push(`${pathname}${query.size ? `?${query}` : ""}`, {scroll: false}));
        }}>
        <option value="">{ar ? "جميع المنتجات" : "All products"}</option>
        {categories.map(c => <option key={c.value} value={c.value}>{ar ? c.ar : c.en}</option>)}
      </select></div>}
      <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor="collection-sort" className="text-start text-sm font-medium text-atp-black">{ar ? "ترتيب حسب" : "Sort by"}</label>
      <select
        id="collection-sort"
        value={options.some(option => option.value === sort) ? sort : ""}
        disabled={pending}
        className="h-12 w-full min-w-0 rounded-lg border border-neutral-400 bg-white px-4 py-3 text-base text-neutral-900 focus:outline-none focus:ring-2 focus:ring-atp-gold disabled:opacity-60"
        onChange={event => {
          const query = new URLSearchParams(searchParams.toString());
          if (event.target.value) query.set("sort", event.target.value);
          else query.delete("sort");
          query.delete("cursor");
          query.delete("page");
          startTransition(() => router.push(`${pathname}${query.size ? `?${query}` : ""}`, { scroll: false }));
        }}
      >
        {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      </div>
      <span role="status" className="sr-only">{pending ? (ar ? "جارٍ الترتيب…" : "Sorting…") : ""}</span>
    </div>
  );
}
