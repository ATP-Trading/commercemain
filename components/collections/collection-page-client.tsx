"use client";

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
  products: Product[];
  locale: "en" | "ar";
}

export default function CollectionPageClient({
  collection,
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
      <p className="bg-atp-off-white py-6 text-center" dir={isRTL ? "rtl" : "ltr"}>
        <span className="font-bold">{products.length.toLocaleString(locale)}</span>{" "}{t("premiumProducts")}
      </p>

      {/* Products Section */}
      <section className="bg-atp-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <m.div
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={staggerSlow}
            className="text-center mb-12 md:mb-16"
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
