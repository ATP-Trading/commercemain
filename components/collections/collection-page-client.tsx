"use client";

import { Suspense, useEffect, useRef } from "react";
import CollectionSort from "@/components/collections/collection-sort";

import { m, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Grid } from "@/components/grid";
import ProductGridItems from "@/components/layout/product-grid-items";
import { StructuredData } from "@/components/structured-data";
import { staggerSlow, fadeInUp, getAccessibleVariants } from "@/lib/animations";
import { useAnimateOnMount } from "@/hooks/use-animate-on-mount";
import type { Product } from "@/lib/shopify/types";

interface CollectionPageClientProps {
  collection: {
    title: string;
    description: string;
    handle: string;
  };
  activeCategory?: string;
  categories?: readonly {value: string; en: string; ar: string}[];
  products: Product[];
  locale: "en" | "ar";
}

export default function CollectionPageClient({
  collection,
  categories,
  activeCategory,
  products,
  locale,
}: CollectionPageClientProps) {
  const productsSection = useRef<HTMLElement>(null);
  useEffect(() => {
    // The section may arrive after the router first tries to follow the fragment.
    if (window.location.hash === "#collection-products") {
      productsSection.current?.scrollIntoView({block: "start"});
    }
  }, [collection.handle, activeCategory]);
  const shouldReduceMotion = useReducedMotion();
  const t = useTranslations("collection");
  const isRTL = locale === "ar";
  
  const useCategoryTiles = collection.handle === "amazing-thai-products";
  const categoryOptions = categories ?? [];
  const selectedCategory = categoryOptions.find(option => option.value === activeCategory)?.value ?? "";

  // Fix: Use animate instead of whileInView to trigger on soft navigation
  // This fixes the issue where products don't show on first mobile navigation
  const isVisible = useAnimateOnMount(50);


  return (
    <>
      <StructuredData
        type="CollectionPage"
        data={{
          name: collection.title,
          description: collection.description,
          url: `https://www.atpgroupservices.ae/${locale}/collections/${collection.handle}`,
        }}
      />

      {/* Stats Section */}
      <p className="bg-atp-off-white py-4 text-center" dir={isRTL ? "rtl" : "ltr"}>
        <span className="font-bold">{products.length.toLocaleString(locale)}</span>{" "}{t("premiumProducts")}
      </p>

      {/* Products Section */}
      <section ref={productsSection} id="collection-products" className="scroll-mt-24 bg-atp-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <m.div
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={staggerSlow}
            className="text-center mb-6 md:mb-8"
          >
            <m.h2
              className="font-display text-heading md:text-display text-atp-black mb-4"
              variants={getAccessibleVariants(fadeInUp, shouldReduceMotion)}
            >
              {t("ourPremiumCollection")}
            </m.h2>
            <m.div
              className="w-24 h-1 bg-atp-gold mx-auto mb-4"
              variants={getAccessibleVariants(fadeInUp, shouldReduceMotion)}
            />
            <m.p
              className="text-body-lg text-atp-charcoal max-w-2xl mx-auto"
              variants={getAccessibleVariants(fadeInUp, shouldReduceMotion)}
            >
              {t("discoverCuratedSelection")}
            </m.p>
          </m.div>

          {useCategoryTiles ? (
            <nav id="collection-categories" tabIndex={-1} aria-label={isRTL ? "الفئات" : "Categories"} className="mx-auto mb-8 grid max-w-2xl scroll-mt-40 grid-cols-3 gap-2">
              {[{ value: "", ar: "الكل", en: "All" }, ...categoryOptions].map(option => {
                const selected = selectedCategory === option.value;
                return (
                  <a key={option.value} href={`/${locale}/collections/${collection.handle}${option.value ? "?category=" + option.value : ""}#collection-categories`}
                    aria-current={selected ? "true" : undefined}
                    className={`flex min-h-11 min-w-0 items-center justify-center rounded-xl border px-1.5 py-1.5 text-center text-sm leading-snug focus-visible:outline-2 ${option.value === "" ? "col-start-2" : option.value === categoryOptions[0]?.value ? "col-start-1" : ""} ${selected ? "border-atp-gold bg-atp-gold/10 font-semibold" : "border-neutral-300 hover:border-atp-gold"}`}>
                    {option[locale]}
                  </a>
                );
              })}
            </nav>
          ) : <Suspense fallback={null}><CollectionSort locale={locale} categories={categories} /></Suspense>}

          {/* Products Grid */}
          {products.length === 0 ? (
            <p className="py-12 text-lg text-center text-atp-charcoal">
              {t("noProductsFound")}
            </p>
          ) : (
            <Grid variant="collection" mobileColumns={2} isRTL={isRTL}>
              <ProductGridItems products={products || []} locale={locale} />
            </Grid>
          )}
          {useCategoryTiles && categoryOptions.length > 0 && (
            <div className="mt-8 flex justify-center">
              <a href="#collection-categories" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-atp-gold px-6 py-3 text-center font-semibold text-atp-black hover:bg-atp-gold/10 focus-visible:outline-2">
                {isRTL ? "تصفّح الفئات" : "Browse categories"}
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
