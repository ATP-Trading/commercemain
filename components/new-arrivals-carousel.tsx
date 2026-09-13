"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { Heart, Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ProductBadges } from "@/components/ui/product-badge";
import { QuickViewModal } from "@/components/ui/quick-view-modal";
import Price from "@/components/price";
import type { Product } from "@/lib/shopify/types";
import { type Locale } from "@/lib/i18n/config";
import { getLocalizedProductHandle, getLocalizedProductTitle } from "@/lib/shopify/i18n-queries";
import {
  containerVariants,
  cardVariants,
  heroImageVariants,
  fadeUpVariants,
  scrollFadeVariants,
  viewportOptions,
  transitions,
  easing,
} from "@/lib/animations/variants";
import { cn } from "@/lib/utils";

interface NewArrivalsCarouselProps {
  products: Product[];
  carouselProducts: Product[];
  locale: Locale;
}

// Editorial grid layout for featured products (5 products)
const editorialGridClasses = [
  "col-span-2 row-span-2", // Large - Position 1 (hero product)
  "col-span-1 row-span-1", // Small - Position 2
  "col-span-1 row-span-1", // Small - Position 3
  "col-span-1 row-span-2", // Tall - Position 4
  "col-span-1 row-span-1", // Small - Position 5
];

export function NewArrivalsCarousel({
  products,
  carouselProducts,
  locale,
}: NewArrivalsCarouselProps) {
  const t = useTranslations("homepage");
  const tActions = useTranslations("productActions");
  const tProduct = useTranslations("product");
  const shouldReduceMotion = useReducedMotion();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const isRTL = locale === "ar";



  // Auto-rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.min(carouselProducts.length, 3));
    }, 4000);
    return () => clearInterval(timer);
  }, [carouselProducts.length]);

  const handleQuickView = useCallback((product: Product) => {
    setQuickViewProduct(product);
  }, []);

  const closeQuickView = useCallback(() => {
    setQuickViewProduct(null);
  }, []);

  if (!products?.length) return null;

  const carouselProductsToShow = carouselProducts.slice(0, 3);
  // Featured products are now pre-limited to 5 from the server
  // The products array already contains exactly 5 manually selected products
  const featuredProducts = products.slice(0, 5);

  return (
    <>
      {/* Hero Section with Carousel */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-atp-black">
        <div className="absolute inset-0">
          <Image
            src="/images/chatimage.png"
            alt="Hero background"
            fill
            className="object-cover opacity-40"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-atp-black/80 via-atp-black/60 to-atp-black/80" />
        </div>

        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px),
                             radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className={cn(
          "relative z-10 container-premium grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full px-4 sm:px-6 lg:px-8",
          isRTL && "lg:flex-row-reverse"
        )}>
          {/* Hero Text */}
          <m.div
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <m.span
              className="inline-block px-4 py-2 glass-gold rounded-full text-atp-gold font-medium text-sm"
              variants={fadeUpVariants}
            >
              {t("premium")}
            </m.span>

            <m.h2
              className={cn(
                "text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif italic text-atp-white leading-tight tracking-tight",
                isRTL && "text-right font-arabic"
              )}
              variants={fadeUpVariants}
            >
              {isRTL ? "منتجاتنا الجديدة" : "New Arrivals"}
            </m.h2>




          </m.div>

          {/* Hero Carousel */}
          <m.div
            className="relative h-full flex items-center justify-center"
            initial="hidden"
            animate="visible"
            variants={heroImageVariants}
          >
            <div className="relative w-full max-w-lg h-[400px] md:h-[500px]">
              {carouselProductsToShow.map((product, index) => (
                <m.div
                  key={product.handle}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 0.95, x: isRTL ? -100 : 100 }}
                  animate={{
                    opacity: index === currentSlide ? 1 : 0,
                    scale: index === currentSlide ? 1 : 0.95,
                    x: index === currentSlide ? 0 : isRTL ? -100 : 100,
                  }}
                  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: easing.smooth }}
                >
                  <div className="flex items-center justify-center h-full px-4 sm:px-0">
                    <div className="relative w-48 h-72 sm:w-60 sm:h-96 md:w-72 md:h-[28rem]">
                      <Image
                        src={product.featuredImage?.url || "/placeholder.svg"}
                        alt={getLocalizedProductTitle(product, locale)}
                        fill
                        className="object-contain filter drop-shadow-2xl"
                        sizes="(max-width: 640px) 192px, (max-width: 768px) 240px, 288px"
                        priority={index === 0}
                      />

                      {/* Product badges */}
                      <div className={cn(
                        "absolute top-4",
                        isRTL ? "right-4" : "left-4"
                      )}>
                        <ProductBadges product={product} size="md" />
                      </div>
                    </div>
                  </div>
                </m.div>
              ))}
            </div>
          </m.div>
        </div>

        {/* Carousel dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3">
          {carouselProductsToShow.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                index === currentSlide
                  ? "bg-atp-gold scale-125"
                  : "bg-atp-white/40 hover:bg-atp-white/60"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>



      {/* Featured Products - Editorial Magazine Layout */}
      <m.section
        className="section-padding bg-gradient-to-b from-atp-light-gray to-atp-white"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOptions}
        variants={containerVariants}
      >
        <div className="container-premium">
          <m.div className="text-center mb-16" variants={fadeUpVariants}>
            <span className="inline-block px-4 py-2 glass rounded-full text-atp-charcoal font-medium text-sm mb-4">
              {tProduct("premium")}
            </span>
            <h2 className={cn(
              "text-4xl md:text-5xl lg:text-6xl font-serif text-atp-black tracking-tight",
              isRTL && "font-arabic"
            )}>
              {t("featuredProductsTitle")}
            </h2>
          </m.div>

          {/* Editorial Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 auto-rows-[200px] md:auto-rows-[250px]">
            {featuredProducts.map((product, index) => {
              // First product is large (hero), index 3 is tall
              const isLarge = index === 0 || index === 3;
              const gridClass = editorialGridClasses[index] || "col-span-1 row-span-1";

              return (
                <m.article
                  key={product.id}
                  className={cn(
                    "relative group rounded-2xl overflow-hidden bg-white shadow-lg tilt-3d",
                    gridClass
                  )}
                  variants={cardVariants}
                  whileHover={shouldReduceMotion ? {} : { y: -8, transition: transitions.normal }}
                >
                  {/* Index number watermark */}
                  <div className={cn(
                    "absolute z-10 font-serif italic text-atp-gold/10 pointer-events-none",
                    isLarge
                      ? "text-[10rem] md:text-[14rem] -top-8 -left-4"
                      : "text-6xl md:text-8xl -top-2 -left-2",
                    isRTL && "left-auto -right-2"
                  )}>
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  {/* Product image */}
                  <Link
                    href={`/${locale}/product/${getLocalizedProductHandle(product, locale as 'en' | 'ar')}`}
                    className="absolute inset-0"
                  >
                    <Image
                      src={product.featuredImage?.url || "/placeholder.svg"}
                      alt={product.featuredImage?.altText || getLocalizedProductTitle(product, locale)}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes={isLarge
                        ? "(max-width: 768px) 100vw, 50vw"
                        : "(max-width: 768px) 50vw, 25vw"
                      }
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-atp-black/80 via-transparent to-transparent" />
                  </Link>

                  {/* Product badges */}
                  <div className={cn(
                    "absolute top-4 z-20",
                    isRTL ? "right-4" : "left-4"
                  )}>
                    <ProductBadges product={product} size="sm" />
                  </div>

                  {/* Wishlist button */}
                  <button
                    className={cn(
                      "absolute top-4 z-20 p-2 rounded-full glass opacity-0 group-hover:opacity-100 transition-opacity",
                      isRTL ? "left-4" : "right-4"
                    )}
                    aria-label={tActions("addToWishlist")}
                  >
                    <Heart className="w-4 h-4 text-atp-white" />
                  </button>

                  {/* Product info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10">
                    <h3 className={cn(
                      "font-semibold text-atp-white mb-2 line-clamp-2",
                      isLarge ? "text-lg md:text-xl" : "text-sm md:text-base"
                    )}>
                      {getLocalizedProductTitle(product, locale)}
                    </h3>

                    <div className="flex items-center justify-between">
                      <div className="text-atp-gold font-bold">
                        {product.variants[0]?.price?.amount ? (
                          <Price
                            amount={product.variants[0].price.amount}
                            currencyCode="AED"
                            className={isLarge ? "text-lg" : "text-sm"}
                          />
                        ) : (
                          <span className="text-sm">{t("priceNotAvailable")}</span>
                        )}
                      </div>

                      {/* Quick view button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleQuickView(product);
                        }}
                        className="p-2 rounded-full glass-gold opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={tActions("quickView")}
                      >
                        <Eye className="w-4 h-4 text-atp-black" />
                      </button>
                    </div>
                  </div>
                </m.article>
              );
            })}
          </div>

          {/* View All button */}
          <m.div
            className="text-center mt-12"
            variants={fadeUpVariants}
          >
            <Link href={`/${locale}/collections/amazing-thai-products`}>
              <Button
                size="lg"
                className="btn-premium px-8"
              >
                {tProduct("viewAllProducts")}
              </Button>
            </Link>
          </m.div>
        </div>
      </m.section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={quickViewProduct !== null}
        onClose={closeQuickView}
      />
    </>
  );
}
