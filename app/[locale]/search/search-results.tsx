"use client";

import type { Product } from "@/lib/shopify/types";

import Grid from "@/components/grid";
import ProductGridItems from "@/components/layout/product-grid-items";
import { sorting } from "@/lib/constants";
import { m } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";

interface SearchResultsProps {
  products: Product[];
  searchQuery: string;
  sortValue: string;
  locale: "en" | "ar";
}

export default function SearchResults({ 
  products, 
  searchQuery, 
  sortValue, 
  locale 
}: SearchResultsProps) {

  return (
    <div className="space-y-8">
      <m.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold">{locale === "ar" ? "نتائج البحث" : "Search Results"}</h2>
        <p>{locale === "ar" ? `عدد المنتجات: ${products.length}` : `${products.length} products`}{searchQuery ? ` — “${searchQuery}”` : ""}</p>
      </m.div>

      {products.length > 0 ? (
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Grid variant="luxury">
            <ProductGridItems
              products={products}
              locale={locale}
            />
          </Grid>
        </m.div>
      ) : searchQuery ? (
        <m.div
          className="bg-atp-white rounded-lg shadow-sm border border-atp-light-gray p-12 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Search className="w-16 h-16 text-atp-charcoal/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-atp-black mb-2">
            {locale === "ar" ? "لم نعثر على منتجات" : "No products found"}
          </h3>
          <p className="text-atp-charcoal mb-6">
            {locale === "ar" ? "جرّب اسمًا آخر أو تصفّح المجموعة" : "Try another search or browse the collection"}
          </p>
          <a className="btn-premium" href={`/${locale}/collections/amazing-thai-products`}>{locale === "ar" ? "تصفّح المنتجات" : "Browse products"}</a>
        </m.div>
      ) : null}
    </div>
  );
}
