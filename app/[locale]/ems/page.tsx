"use client";

import { fetchCollectionProducts } from "@/components/cart/actions";
import { Grid } from "@/components/grid";
import ProductGridItems from "@/components/layout/product-grid-items";
import Footer from "@/components/layout/footer";
import { useParams } from "next/navigation";

import { StructuredData } from "@/components/structured-data";
import { m } from "framer-motion";
import { useState, useEffect } from "react";

export default function EMSPage() {
  const params = useParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await fetchCollectionProducts("ems");
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
  }, []);

  return (
    <>
      <StructuredData
        type="CollectionPage"
        data={{
          name: "EMS Training",
          description: "Professional EMS training equipment and solutions",
          url: "https://www.atpgroupservices.ae/ems",
        }}
      />

      <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-atp-charcoal via-atp-black to-atp-charcoal overflow-hidden">
        <div className="absolute inset-0 bg-[url('/ems-training-facility.png')] bg-cover bg-center opacity-15"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-atp-black/90 via-transparent to-atp-black/50"></div>

        <m.div
          className="relative z-10 container-premium text-center text-atp-white"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <m.h1
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-6 tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
          >
            <span className="text-atp-gold">EMS</span>
            <br />
            Training
          </m.h1>

          <m.p
            className="text-xl md:text-2xl text-atp-white/90 mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4 }}
          >
            Professional EMS training equipment and solutions for healthcare
            professionals, featuring cutting-edge technology and proven
            methodologies.
          </m.p>

          <m.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.6 }}
          >
            <button className="btn-atp-gold mr-4">View Equipment</button>
            <button className="bg-atp-white text-atp-black border-2 border-atp-white px-8 py-3 font-semibold tracking-wide uppercase text-sm transition-all duration-300 hover:bg-atp-black hover:text-atp-white hover:border-atp-black">
              Training Programs
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
              <h3 className="text-4xl font-bold text-atp-black">15+</h3>
              <p className="text-atp-charcoal uppercase tracking-wide text-sm">
                Years Experience
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-atp-black">500+</h3>
              <p className="text-atp-charcoal uppercase tracking-wide text-sm">
                Professionals Trained
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-atp-gold">ISO</h3>
              <p className="text-atp-charcoal uppercase tracking-wide text-sm">
                Certified Equipment
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
              Professional Equipment
            </h2>
            <div className="w-24 h-1 bg-atp-gold mx-auto mb-6"></div>
            <p className="text-lg text-atp-charcoal max-w-2xl mx-auto">
              State-of-the-art EMS training equipment designed for healthcare
              professionals who demand excellence and reliability.
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

      <Footer />
    </>
  );
}
