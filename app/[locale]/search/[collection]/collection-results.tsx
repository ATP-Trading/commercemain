"use client";

import { Suspense } from "react";
import CollectionSort from "@/components/collections/collection-sort";

import Grid from "@/components/grid";
import ProductGridItems from "@/components/layout/product-grid-items";
import CollectionHero from "@/components/collection/collection-hero";
import CollectionStats from "@/components/collection/collection-stats";
import { CollectionPageSkeleton } from "@/components/product/product-card-skeleton";
import { m, useReducedMotion } from "framer-motion";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { staggerSlow, fadeInUp, getAccessibleVariants, defaultViewport } from "@/lib/animations";

interface CollectionResultsProps {
  categories?: readonly {value: string; en: string; ar: string}[];
  products: any[];
  collection: any;
  locale: "en" | "ar";
}

export default function CollectionResults({ 
  products, 
  collection,
  categories,
  locale 
}: CollectionResultsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations('collection');
  const shouldReduceMotion = useReducedMotion();
  const isRTL = locale === 'ar';
  
  useEffect(() => {
    // Simulate loading for smooth transition
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <CollectionPageSkeleton isRTL={isRTL} />;
  }

  // Prepare stats data
  const stats = [
    { 
      value: products.length, 
      suffix: "+", 
      label: t('premiumProducts') 
    },
    { 
      value: 100, 
      suffix: "%", 
      label: t('naturalIngredients') 
    },
    { 
      value: 98, 
      suffix: "%", 
      label: t('customerSatisfaction') || "Satisfaction" 
    },
    { 
      value: 10, 
      suffix: "K+", 
      label: t('happyCustomers') || "Happy Customers" 
    },
  ];

  // Default hero image - can be overridden by collection.image
  const heroImage = {
    src: collection?.image?.url || "/skincare-hero-banner.jpg",
    alt: collection?.title || t('ourPremiumCollection'),
    mobileSrc: collection?.image?.url || "/skincare-hero-banner.jpg",
  };

  return (
    <div className="space-y-0">
      {/* Collection Hero */}
      <CollectionHero
        title={collection?.title || t('ourPremiumCollection')}
        subtitle={t('premiumWellness') || "Premium Wellness"}
        description={collection?.description || t('discoverCuratedSelection')}
        image={heroImage}
        isRTL={isRTL}
      />

      {/* Stats Section */}
      <CollectionStats stats={stats} isRTL={isRTL} />

      {/* Products Section */}
      <section className="bg-atp-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <m.div
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={staggerSlow}
            className="text-center mb-12 md:mb-16"
          >
            <m.h2 
              className="font-display text-heading md:text-display text-atp-black mb-4"
              variants={getAccessibleVariants(fadeInUp, shouldReduceMotion)}
            >
              {t('exploreCollection') || "Explore Collection"}
            </m.h2>
            <m.div 
              className="w-24 h-1 bg-atp-gold mx-auto mb-4"
              variants={getAccessibleVariants(fadeInUp, shouldReduceMotion)}
            />
            <m.p 
              className="text-body-lg text-atp-charcoal max-w-2xl mx-auto"
              variants={getAccessibleVariants(fadeInUp, shouldReduceMotion)}
            >
              {t('discoverCuratedSelection')}
            </m.p>
          </m.div>

          <Suspense fallback={null}><CollectionSort locale={locale} categories={categories} /></Suspense>

          {/* Products Grid */}
          {products.length === 0 ? (
            <p className="py-12 text-lg text-center text-atp-charcoal">
              {t('noProductsFound')}
            </p>
          ) : (
            <Grid variant="collection" mobileColumns={2} isRTL={isRTL}>
              <ProductGridItems
                products={products}
                locale={locale}
              />
            </Grid>
          )}
        </div>
      </section>
    </div>
  );
}
