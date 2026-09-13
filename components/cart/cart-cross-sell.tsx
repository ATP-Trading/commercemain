"use client";

/**
 * CartCrossSell Component
 * 
 * "You might also like" section for cart upselling.
 * Displays complementary products to items in cart.
 * 
 * Part of ATP Trading luxury e-commerce redesign.
 */

import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { useRTL } from "@/hooks/use-rtl";
import { Sparkles, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { transitions, easing } from "@/lib/animations/variants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Price from "@/components/price";
import { useState, useRef } from "react";
import { getLocalizedProductTitle } from "@/lib/shopify/i18n-queries";

interface CrossSellProduct {
  id: string;
  title: string;
  handle: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  image?: {
    url: string;
    altText: string;
  };
  // Localization fields
  translations?: Array<{
    key: string;
    value: string;
    locale: string;
  }>;
  titleAr?: {
    value: string;
  };
}

interface CartCrossSellProps {
  products: CrossSellProduct[];
  onAddToCart: (productId: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function CartCrossSell({
  products,
  onAddToCart,
  isLoading = false,
  className,
}: CartCrossSellProps) {
  const t = useTranslations("cart");
  const locale = useLocale() as 'en' | 'ar';
  const { isRTL } = useRTL();
  const prefersReducedMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  const handleAddToCart = async (productId: string) => {
    setAddingId(productId);
    try {
      await onAddToCart(productId);
    } finally {
      setTimeout(() => setAddingId(null), 500);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!products || products.length === 0) return null;

  return (
    <div className={cn("py-4 border-t border-neutral-200 dark:border-neutral-700", className)}>
      {/* Header */}
      <div className={cn(
        "flex items-center gap-2 mb-3",
        isRTL && "flex-row-reverse"
      )}>
        <Sparkles className="w-4 h-4 text-atp-gold" />
        <span className={cn(
          "text-sm font-medium",
          isRTL && "font-arabic"
        )}>
          {isRTL ? "قد يعجبك أيضاً" : "You might also like"}
        </span>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Scroll Buttons */}
        {products.length > 2 && (
          <>
            <m.button
              className={cn(
                "absolute top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white dark:bg-neutral-800 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                isRTL ? "right-0 -mr-2" : "left-0 -ml-2"
              )}
              onClick={() => scroll(isRTL ? "right" : "left")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Scroll left"
            >
              {isRTL ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </m.button>
            <m.button
              className={cn(
                "absolute top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white dark:bg-neutral-800 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                isRTL ? "left-0 -ml-2" : "right-0 -mr-2"
              )}
              onClick={() => scroll(isRTL ? "left" : "right")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Scroll right"
            >
              {isRTL ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </m.button>
          </>
        )}

        {/* Products Scroll */}
        <div
          ref={scrollRef}
          className={cn(
            "flex gap-3 overflow-x-auto scrollbar-hide pb-2",
            isRTL && "flex-row-reverse"
          )}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <AnimatePresence mode="popLayout">
            {products.map((product, index) => (
              <m.div
                key={product.id}
                className="flex-shrink-0 w-[140px]"
                initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: easing.smooth,
                }}
              >
                <m.div
                  className="bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                  whileHover={prefersReducedMotion ? {} : { y: -2, boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}
                  transition={transitions.fast}
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-white dark:bg-neutral-800">
                    {product.image?.url ? (
                      <Image
                        src={product.image.url}
                        alt={product.image.altText || getLocalizedProductTitle(product, locale)}
                        fill
                        className="object-cover"
                        sizes="140px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
                        <span className="text-2xl">📦</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className={cn("p-2", isRTL && "text-right")}>
                    <h4 className="text-xs font-medium line-clamp-2 mb-1 leading-tight">
                      {getLocalizedProductTitle(product, locale)}
                    </h4>
                    <div className={cn("flex items-center justify-between gap-1", isRTL && "flex-row-reverse")}>
                      <div className="flex flex-col">
                        <Price
                          amount={product.price.amount}
                          currencyCode={product.price.currencyCode}
                          className="text-xs font-semibold"
                        />
                      </div>
                      
                      {/* Quick Add Button */}
                      <m.button
                        className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center transition-colors",
                          addingId === product.id
                            ? "bg-atp-gold text-atp-black"
                            : "bg-atp-black text-white hover:bg-atp-gold hover:text-atp-black"
                        )}
                        onClick={() => handleAddToCart(product.id)}
                        disabled={addingId === product.id}
                        whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Add ${getLocalizedProductTitle(product, locale)} to cart`}
                      >
                        {addingId === product.id ? (
                          <m.div
                            className="w-3 h-3 border-2 border-atp-black/30 border-t-atp-black rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
                          />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </m.button>
                    </div>
                  </div>
                </m.div>
              </m.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for cross-sell section
 */
export function CartCrossSellSkeleton() {
  return (
    <div className="py-4 border-t border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-4 h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
        <div className="w-32 h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
      </div>
      <div className="flex gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-[140px] flex-shrink-0">
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden">
              <div className="aspect-square bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
              <div className="p-2 space-y-2">
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
