"use client";

import { Suspense } from "react";
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
  categories?: readonly {value: string; en: string; ar: string}[];
  products: Product[];
  locale: "en" | "ar";
}

export default function CollectionPageClient({
  collection,
  categories,
  products,
  locale,
}: CollectionPageClientProps) {
  const shouldReduceMotion = useReducedMotion();
  const t = useTranslations("collection");
  const isRTL = locale === "ar";
  
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
      <section id="collection-products" className="scroll-mt-24 bg-atp-white py-8 md:py-12">
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

          <Suspense fallback={null}><CollectionSort locale={locale} categories={categories} /></Suspense>

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
        </div>
      </section>
    </>
  );
}
