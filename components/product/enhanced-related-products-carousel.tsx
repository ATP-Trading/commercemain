"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  m,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Price from "@/components/price";
import type { Product } from "@/lib/shopify/types";
import { getLocalizedProductTitle, getLocalizedProductHandle } from "@/lib/shopify/i18n-queries";

interface EnhancedRelatedProductsCarouselProps {
  products: Product[];
  locale: "en" | "ar";
  title?: string;
  autoPlay?: boolean;
  showDots?: boolean;
  itemsPerView?: number;
  collectionHandle?: string;
}

interface ProductCardProps {
  product: Product;
  locale: "en" | "ar";
  index: number;
  isActive?: boolean;
}

function ProductCard({
  product,
  locale,
  index,
  isActive = false,
}: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const title = getLocalizedProductTitle(product, locale);
  const handle = getLocalizedProductHandle(product, locale);
  const price = product.priceRange.minVariantPrice;
  const isPremium =
    product.tags?.includes("premium") ||
    product.title.toLowerCase().includes("premium");

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeInOut" as const,
      },
    },
    hover: {
      scale: 1.02,
      y: -5,
      transition: {
        duration: 0.3,
        ease: "easeOut" as const,
      },
    },
    active: {
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  return (
    <m.div
      className="group relative bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-atp-black/15 hover:border-atp-gold/40 transition-all duration-700 flex-shrink-0"
      style={{ width: "280px" }}
      variants={cardVariants}
      initial="hidden"
      animate={isActive ? "active" : "visible"}
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-atp-gold via-atp-gold/50 to-atp-gold rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-sm" />

      {/* Product Badges */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        {isPremium && (
          <m.div
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: "backOut" }}
          >
            <Badge className="bg-gradient-to-r from-atp-gold to-yellow-500 text-atp-black text-xs font-bold px-3 py-1 shadow-lg">
              <Star className="w-2 h-2 mr-1 fill-current" />
              {locale === "ar" ? "متميز" : "Premium"}
            </Badge>
          </m.div>
        )}
      </div>

      <Link href={`/${locale}/product/${handle}`} className="block">
        {/* Product Image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <m.div
            className="w-full h-full"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {product.featuredImage?.url ? (
              <>
                <Image
                  src={product.featuredImage.url}
                  alt={product.featuredImage.altText || title}
                  fill
                  className={`object-contain p-3 transition-all duration-700 ${imageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
                    }`}
                  onLoad={() => setImageLoaded(true)}
                  sizes="280px"
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-gray-400 text-sm font-medium">
                  No Image
                </span>
              </div>
            )}
          </m.div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />


        </div>

        {/* Product Info */}
        <div className="p-5 space-y-4">
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2 group-hover:text-atp-gold transition-colors duration-300">
              {title}
            </h3>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Price
                  amount={price.amount}
                  currencyCode={price.currencyCode}
                  className="font-bold text-gray-900 text-lg"
                />
              </div>


            </div>
          </div>
        </div>
      </Link>
    </m.div>
  );
}

export function EnhancedRelatedProductsCarousel({
  products,
  locale,
  title,
  autoPlay = true,
  showDots = true,
  itemsPerView = 4,
  collectionHandle,
}: EnhancedRelatedProductsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isPlaying && products.length > itemsPerView) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) =>
          prev >= products.length - itemsPerView ? 0 : prev + 1
        );
      }, 4000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, products.length, itemsPerView]);

  const goToSlide = (index: number) => {
    setCurrentIndex(
      Math.max(0, Math.min(index, products.length - itemsPerView))
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev >= products.length - itemsPerView ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev <= 0 ? products.length - itemsPerView : prev - 1
    );
  };

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  if (!products.length) return null;

  const sectionTitle =
    title || (locale === "ar" ? "المنتجات ذات الصلة" : "Related Products");
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < products.length - itemsPerView;

  return (
    <m.section
      ref={containerRef}
      className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden"
      style={{ y, opacity }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,_theme(colors.atp.gold)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,_theme(colors.atp.gold)_0%,_transparent_50%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <m.div
          className="flex items-center justify-between mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div>
            <h2
              className={`text-4xl md:text-5xl font-bold text-gray-900 mb-3 ${locale === "ar" ? "font-arabic" : ""
                }`}
            >
              {sectionTitle}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl">
              {locale === "ar"
                ? "اكتشف المنتجات المشابهة المختارة بعناية لك"
                : "Discover carefully curated similar products just for you"}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              aria-label={isPlaying ? (locale === "ar" ? "إيقاف العرض التلقائي" : "Pause slideshow") : (locale === "ar" ? "تشغيل العرض التلقائي" : "Play slideshow")}
              onClick={toggleAutoPlay}
              className="rounded-full border-2 hover:border-atp-gold hover:text-atp-gold"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label={locale === "ar" ? "المنتجات السابقة" : "Previous products"}
                onClick={prevSlide}
                disabled={!canGoPrev}
                className="rounded-full border-2 hover:border-atp-gold hover:text-atp-gold disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label={locale === "ar" ? "المنتجات التالية" : "Next products"}
                onClick={nextSlide}
                disabled={!canGoNext}
                className="rounded-full border-2 hover:border-atp-gold hover:text-atp-gold disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </m.div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <m.div
                key={currentIndex}
                className="flex gap-6"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                {products
                  .slice(currentIndex, currentIndex + itemsPerView)
                  .map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      locale={locale}
                      index={index}
                      isActive={index === 1} // Highlight the second item
                    />
                  ))}
              </m.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Dots Indicator */}
        {showDots && products.length > itemsPerView && (
          <m.div
            className="flex justify-center items-center gap-3 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {[...Array(Math.ceil(products.length - itemsPerView + 1))].map(
              (_, index) => (
                <button
                  key={index}
                  aria-label={`${locale === "ar" ? "عرض المجموعة" : "Show group"} ${index + 1}`}
                  aria-current={index === currentIndex ? "true" : undefined}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 rounded-full ${index === currentIndex
                    ? "bg-atp-gold w-8 h-3"
                    : "bg-gray-300 hover:bg-gray-400 w-3 h-3"
                    }`}
                />
              )
            )}
          </m.div>
        )}

        {/* View All Button */}
        <m.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-atp-gold to-yellow-500 hover:from-atp-black hover:to-gray-900 text-atp-black hover:text-white font-bold px-10 py-4 rounded-full transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:scale-105"
          >
            <Link href={collectionHandle ? `/${locale}/collections/${collectionHandle}` : `/${locale}/search`}>
              {locale === "ar" ? "عرض جميع المنتجات" : "Explore All Products"}
            </Link>
          </Button>
        </m.div>
      </div>
    </m.section>
  );
}
