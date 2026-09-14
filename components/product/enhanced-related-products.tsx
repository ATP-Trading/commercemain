"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import {
  Heart,
  Eye,
  ShoppingBag,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Price from "@/components/price";
import type { Product } from "@/lib/shopify/types";
import { getLocalizedProductTitle, getLocalizedProductHandle } from "@/lib/shopify/i18n-queries";
import { useTranslations } from "next-intl";

interface EnhancedRelatedProductsProps {
  products: Product[];
  locale: "en" | "ar";
  title?: string;
  collectionHandle?: string;
}

interface ProductCardProps {
  product: Product;
  locale: "en" | "ar";
  index: number;
  onAddToCart: (productId: string) => void;
  onToggleWishlist: (productId: string) => void;
  isWishlisted: boolean;
}

function ProductCard({
  product,
  locale,
  index,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}: ProductCardProps) {
  const t = useTranslations('product');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const title = getLocalizedProductTitle(product, locale);
  const handle = getLocalizedProductHandle(product, locale);
  const price = product.priceRange.minVariantPrice;
  const isPremium =
    product.tags?.includes("premium") ||
    product.title.toLowerCase().includes("premium");

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut" as const,
      },
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: { duration: 0.3, ease: "easeOut" as const },
    },
  };

  const imageVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.1, transition: { duration: 0.6, ease: "easeOut" as const } },
  };

  const overlayVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" as const },
    },
  };

  return (
    <m.div
      className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-atp-black/10 hover:border-atp-gold/30 transition-all duration-500"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Product Badges */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1">
        {isPremium && (
          <Badge className="bg-atp-gold text-atp-black text-xs font-bold px-2 py-1">
            <Star className="w-2 h-2 mr-1" />
            {t('premium')}
          </Badge>
        )}
      </div>

      <Link href={`/${locale}/product/${handle}`} className="block">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <m.div
            variants={imageVariants}
            initial="initial"
            animate={isHovered ? "hover" : "initial"}
            className="w-full h-full"
          >
            {product.featuredImage?.url ? (
              <>
                <Image
                  src={product.featuredImage.url}
                  alt={product.featuredImage.altText || title}
                  fill
                  className={`object-contain transition-opacity duration-700 ${imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                  onLoad={() => setImageLoaded(true)}
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-gray-400 text-sm font-medium">
                  {t('noImage')}
                </span>
              </div>
            )}
          </m.div>

          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-atp-gold transition-colors duration-200">
              {title}
            </h3>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Price
                  amount={price.amount}
                  currencyCode={price.currencyCode}
                  className="font-bold text-gray-900"
                />
              </div>


            </div>
          </div>
        </div>
      </Link>
    </m.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300" />
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded-md" />
          <div className="h-3 bg-gray-200 rounded-md w-2/3" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-5 bg-gray-200 rounded-md w-16" />
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-3 h-3 bg-gray-200 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function EnhancedRelatedProducts({
  products,
  locale,
  title,
  collectionHandle,
}: EnhancedRelatedProductsProps) {
  const t = useTranslations('product');
  const [currentPage, setCurrentPage] = useState(0);
  const [wishlistedItems, setWishlistedItems] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);

  const itemsPerPage = 4;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const canGoNext = currentPage < totalPages - 1;
  const canGoPrev = currentPage > 0;

  useEffect(() => {
    // Simulate loading delay for better UX
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleAddToCart = async (productId: string) => {
    // Implement add to cart logic
    console.log("Add to cart:", productId);
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlistedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const nextPage = () => {
    if (canGoNext) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (canGoPrev) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const visibleProducts = products.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  if (!products.length) return null;

  const sectionTitle = title || t('relatedProducts');

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50/50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <m.div
          className="flex items-center justify-between mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h2
              className={`text-3xl md:text-4xl font-bold text-gray-900 mb-2 ${locale === "ar" ? "font-arabic" : ""
                }`}
            >
              {sectionTitle}
            </h2>
            <p className="text-gray-600 max-w-2xl">
              {t('discoverSimilarProducts')}
            </p>
          </div>

          {/* Navigation Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label={locale === "ar" ? "المنتجات السابقة" : "Previous products"}
                onClick={prevPage}
                disabled={!canGoPrev}
                className="rounded-full border-2 hover:border-atp-gold hover:text-atp-gold disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label={locale === "ar" ? "المنتجات التالية" : "Next products"}
                onClick={nextPage}
                disabled={!canGoNext}
                className="rounded-full border-2 hover:border-atp-gold hover:text-atp-gold disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </m.div>

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          <m.div
            key={currentPage}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
          >
            {isLoading
              ? [...Array(itemsPerPage)].map((_, index) => (
                <LoadingSkeleton key={index} />
              ))
              : visibleProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  locale={locale}
                  index={index}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  isWishlisted={wishlistedItems.has(product.id)}
                />
              ))}
          </m.div>
        </AnimatePresence>

        {/* Page Indicators */}
        {totalPages > 1 && (
          <m.div
            className="flex justify-center items-center gap-2 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                aria-label={`${locale === "ar" ? "عرض المجموعة" : "Show group"} ${index + 1}`}
                aria-current={index === currentPage ? "true" : undefined}
                onClick={() => setCurrentPage(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentPage
                  ? "bg-atp-gold w-8"
                  : "bg-gray-300 hover:bg-gray-400"
                  }`}
              />
            ))}
          </m.div>
        )}

        {/* View All Button */}
        <m.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            asChild
            size="lg"
            className="bg-atp-gold hover:bg-atp-black text-atp-black hover:text-atp-gold font-semibold px-8 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Link href={collectionHandle ? `/${locale}/collections/${collectionHandle}` : `/${locale}/search`}>
              {t('viewAllProducts')}
            </Link>
          </Button>
        </m.div>
      </div>
    </section>
  );
}
