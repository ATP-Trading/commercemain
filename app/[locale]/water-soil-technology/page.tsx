"use client";

import { fetchCollectionProducts } from "@/components/cart/actions";
import { Grid } from "@/components/grid";
import ProductGridItems from "@/components/layout/product-grid-items";
import { useParams } from "next/navigation";

import { StructuredData } from "@/components/structured-data";
import { m } from "framer-motion";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export default function WaterSoilTechnologyPage() {
  const params = useParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const t = useTranslations('collection');
  // Ensure locale always has a value (never undefined) to maintain stable dependency array size
  const locale = (params.locale as "en" | "ar") || "en";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Parse locale for Shopify API
        const localeForApi = locale === 'ar' 
          ? { language: 'AR', country: 'AE' }
          : { language: 'EN', country: 'AE' };
          
        const result = await fetchCollectionProducts(
          "water-soil-technology-solutions",
          undefined,
          undefined,
          localeForApi
        );
        if (result.success) {
          setProducts(result.products);
        } else {
          console.error("Failed to fetch products:", result.error);
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [locale]);

  return (
    <>
      <StructuredData
        type="CollectionPage"
        data={{
          name: "Water & Soil Technology Solutions",
          description:
            "Advanced water and soil technology solutions for environmental sustainability",
          url: "https://www.atpgroupservices.ae/water-soil-technology",
        }}
      />

      <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-atp-black via-atp-charcoal to-atp-black overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-water-tech.png')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-atp-black/80 via-transparent to-atp-black/40"></div>

        <m.div
          className="relative z-10 container-premium text-center text-atp-white"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <m.h1
            className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 tracking-tight leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
          >
            {locale === 'ar' ? (
              t('waterSoilTechTitle')
            ) : (
              <>
                Water & Soil
                <br />
                <span className="text-atp-gold">Technology</span>
              </>
            )}
          </m.h1>

          <m.p
            className="text-xl md:text-2xl text-atp-white/90 mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4 }}
          >
            {t('cuttingEdgeTechnology')}
          </m.p>

          <m.div
            className="flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.6 }}
          >
            <button className="btn-atp-gold">{t('exploreSolutions')}</button>
            <button className="btn-premium-outline text-atp-white border-atp-white hover:bg-atp-white hover:text-atp-black">
              {t('sustainabilityReport')}
            </button>
          </m.div>
        </m.div>
      </section>

      <section className="section-padding bg-atp-white">
        <div className="container-premium">
          <m.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-atp-black">95%</h3>
              <p className="text-atp-charcoal uppercase tracking-wide text-sm">
                {t('waterEfficiency')}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-atp-black">50+</h3>
              <p className="text-atp-charcoal uppercase tracking-wide text-sm">
                {t('projectsCompleted')}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-atp-gold">{t('ecoLabel')}</h3>
              <p className="text-atp-charcoal uppercase tracking-wide text-sm">
                {t('certifiedSolutions')}
              </p>
            </div>
          </m.div>
        </div>
      </section>

      <section className="section-padding bg-atp-off-white">
        <div className="container-premium">
          <m.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-atp-black mb-6">
              {t('innovativeSolutions')}
            </h2>
            <div className="w-24 h-1 bg-atp-gold mx-auto mb-6"></div>
            <p className="text-lg text-atp-charcoal max-w-2xl mx-auto">
              {t('cuttingEdgeTechnology')}
            </p>
          </m.div>

          <Grid variant="luxury">
            <ProductGridItems
              products={products || []}
              locale={params.locale as "en" | "ar"}
            />
          </Grid>
        </div>
      </section>
    </>
  );
}
