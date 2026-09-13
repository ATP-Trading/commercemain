"use client";

import React from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import type { SortFilterItem } from "@/lib/constants";

export default function SearchLayoutClient({ sorting, children }: {
  sorting: SortFilterItem[];
  children: React.ReactNode;
}) {
  const locale = useLocale();
  const ar = locale === "ar";
  const params = useSearchParams();
  const [collections, results] = React.Children.toArray(children);
  const sortLabels: Record<string, string> = {
    "": "الأكثر صلة", "trending-desc": "الأكثر مبيعًا", "latest-desc": "الأحدث",
    "price-asc": "السعر: من الأقل للأعلى", "price-desc": "السعر: من الأعلى للأقل",
  };
  return <div dir={ar ? "rtl" : "ltr"}>
    <header className="bg-atp-black text-white py-8">
      <div className="container-premium">
        <h1 className="text-3xl font-bold mb-6">{ar ? "ابحث عن منتجاتنا" : "Discover Products"}</h1>
        <form action={`/${locale}/search`} className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <label className="min-w-0">{ar ? "اسم المنتج أو كلمة البحث" : "Product name or keyword"}
            <input key={params.get('q')} name="q" type="search" defaultValue={params.get('q') || ''}
              placeholder={ar ? "ابحث عن منتج" : "Search products"}
              className="mt-2 w-full rounded border p-3 text-black bg-white" />
          </label>
          <label>{ar ? "ترتيب النتائج" : "Sort results"}
            <select key={params.get('sort')} name="sort" defaultValue={params.get('sort') || ''} className="mt-2 block w-full rounded border p-3 text-black bg-white">
              {sorting.map(item => <option key={item.slug || ''} value={item.slug || ''}>{ar ? sortLabels[item.slug || ''] : item.title}</option>)}
            </select>
          </label>
          <button type="submit" className="self-end rounded bg-atp-gold px-6 py-3 text-black font-semibold">{ar ? "بحث" : "Search"}</button>
        </form>
      </div>
    </header>
    <div className="container-premium py-8 space-y-6">
      <details className="rounded border p-4">
        <summary className="cursor-pointer font-semibold">{ar ? "تصفّح المجموعات" : "Browse collections"}</summary>
        <div className="mt-4">{collections}</div>
      </details>
      {results}
    </div>
  </div>;
}
