"use client";

import type React from "react";
import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Link } from "@/src/i18n/navigation";
import { m, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ShoppingBag, Eye, Heart, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Price from "../price";
import { cardVariants, cardImageVariants, easing } from "@/lib/animations/variants";

interface LuxuryProductCardProps {
  product: {
    handle: string;
    title: string;
    featuredImage?: { url: string; altText?: string };
    priceRange: {
      minVariantPrice: { amount: string; currencyCode: string };
    };
    availableForSale?: boolean;
    rating?: number;
    reviewCount?: number;
  };
  priority?: boolean;
  isRTL?: boolean;
  onQuickAdd?: (handle: string) => void;
  onQuickView?: (handle: string) => void;
  onAddToWishlist?: (handle: string) => void;
  /** Enable 3D tilt effect on hover. Default: true */
  enable3DTilt?: boolean;
  /** Show rating stars. Default: true */
  showRating?: boolean;
}

export function LuxuryProductCard({
  product,
  priority = false,
  isRTL = false,
  onQuickAdd,
  onQuickView,
  onAddToWishlist,
  enable3DTilt = true,
  showRating = true,
}: LuxuryProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const {
    handle,
    title,
    featuredImage,
    priceRange,
    availableForSale = true,
    rating,
    reviewCount = 0,
  } = product;

  const price = priceRange.minVariantPrice;

  // Check if this is the EMS PRO ONE SUIT product that should redirect externally
  const isEMSProOneSuit = handle === "ems-pro-one-suit";

  // 3D Tilt Effect using mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!enable3DTilt || !cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      mouseX.set(x);
      mouseY.set(y);
    },
    [enable3DTilt, mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickAdd && !isAddingToCart) {
      setIsAddingToCart(true);
      try {
        await onQuickAdd(handle);
      } finally {
        // Delay to show loading state
        setTimeout(() => setIsAddingToCart(false), 500);
      }
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(handle);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    if (onAddToWishlist) {
      onAddToWishlist(handle);
    }
  };

  // Generate star rating
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating ?? 0);
    const hasHalfStar = (rating ?? 0) % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star
            key={i}
            className="w-3 h-3 fill-[var(--atp-gold)] text-[var(--atp-gold)]"
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star
            key={i}
            className="w-3 h-3 fill-[var(--atp-gold)]/50 text-[var(--atp-gold)]"
          />
        );
      } else {
        stars.push(
          <Star key={i} className="w-3 h-3 text-neutral-300" />
        );
      }
    }
    return stars;
  };

  return (
    <m.div
      ref={cardRef}
      className={cn(
        "group relative flex flex-col h-full w-full overflow-hidden rounded-xl bg-white",
        "border border-neutral-200 transition-all duration-500",
        "hover:border-[var(--atp-gold)]/50 hover:shadow-luxury-lg",
        !availableForSale && "opacity-60"
      )}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={cardVariants}
    >
      <m.div
        style={{
          rotateX: enable3DTilt ? rotateX : 0,
          rotateY: enable3DTilt ? rotateY : 0,
          transformStyle: "preserve-3d",
        }}
        className="flex flex-col h-full"
      >
        {isEMSProOneSuit ? (
          <a
            href="https://emsproone.com/?ref=ATPTRADING"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col h-full"
          >
            {/* Image Container */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-50">
              {/* Badges */}
              <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                {!availableForSale && (
                  <span className="bg-neutral-900 text-white px-3 py-1 text-xs font-medium uppercase tracking-wider rounded-sm">
                    Sold Out
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <m.button
                onClick={handleWishlist}
                className={cn(
                  "absolute top-3 right-3 z-20 p-2 rounded-full",
                  "bg-white/80 backdrop-blur-sm shadow-sm",
                  "transition-all duration-300",
                  "opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0",
                  "hover:bg-white hover:scale-110",
                  "md:opacity-0 md:translate-y-2",
                  // On mobile, always show
                  "max-md:opacity-100 max-md:translate-y-0"
                )}
                whileTap={{ scale: 0.9 }}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isWishlisted
                      ? "fill-red-500 text-red-500"
                      : "text-neutral-600 hover:text-red-500"
                  )}
                />
              </m.button>

              {/* Product Image with 3D depth effect */}
              {featuredImage ? (
                <m.div
                  className="h-full w-full"
                  style={{
                    translateZ: enable3DTilt ? 50 : 0,
                  }}
                  variants={cardImageVariants}
                  initial="rest"
                  whileHover="hover"
                >
                  <Image
                    src={featuredImage.url}
                    alt={featuredImage.altText || title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                    priority={priority}
                    className={cn(
                      "object-cover transition-all duration-700",
                      imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
                    )}
                    onLoad={() => setImageLoaded(true)}
                  />
                </m.div>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-100">
                  <span className="text-neutral-400 text-sm">No Image</span>
                </div>
              )}

              {/* Skeleton Shimmer */}
              {!imageLoaded && featuredImage && (
                <div className="skeleton-gold absolute inset-0 z-10" />
              )}

              {/* Hover Actions Overlay */}
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 z-20 p-4",
                  "bg-gradient-to-t from-black/60 via-black/30 to-transparent",
                  "transition-all duration-300 ease-out",
                  "opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0",
                  "md:opacity-0 md:translate-y-4",
                  // Mobile: always visible
                  "max-md:opacity-100 max-md:translate-y-0 max-md:bg-gradient-to-t max-md:from-black/40 max-md:via-transparent max-md:to-transparent"
                )}
              >
                <div className="flex gap-2">
                  {/* Quick Add Button */}
                  {onQuickAdd && availableForSale && (
                    <m.button
                      onClick={handleQuickAdd}
                      disabled={isAddingToCart}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 px-4",
                        "bg-white text-black text-sm font-medium",
                        "rounded-lg shadow-lg",
                        "transition-all duration-300",
                        "hover:bg-[var(--atp-gold)] hover:text-black",
                        "disabled:opacity-70 disabled:cursor-not-allowed"
                      )}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isAddingToCart ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </m.button>
                  )}

                  {/* Quick View Button */}
                  {onQuickView && (
                    <m.button
                      onClick={handleQuickView}
                      className={cn(
                        "p-3 bg-white/90 backdrop-blur-sm text-black",
                        "rounded-lg shadow-lg",
                        "transition-all duration-300",
                        "hover:bg-[var(--atp-gold)]"
                      )}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Quick view"
                    >
                      <Eye className="w-4 h-4" />
                    </m.button>
                  )}
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div
              className={cn(
                "flex flex-col gap-2 p-4 flex-grow",
                isRTL ? "text-right" : "text-left"
              )}
            >
              {/* Rating */}
              {showRating && typeof rating === "number" && Number.isFinite(rating) && rating >= 0 && rating <= 5 && reviewCount > 0 && (
                <div
                  className={cn(
                    "flex items-center gap-1.5",
                    isRTL && "flex-row-reverse justify-end"
                  )}
                >
                  <div className="flex">{renderStars()}</div>
                  <span className="text-xs text-neutral-500">({reviewCount})</span>
                </div>
              )}

              {/* Title */}
              <h3 className="font-medium text-neutral-900 text-sm md:text-base leading-snug line-clamp-2 min-h-[2.5em]">
                {title}
              </h3>

              {/* Price */}
              <div
                className={cn(
                  "flex items-center gap-2 mt-auto",
                  isRTL && "flex-row-reverse justify-end"
                )}
              >
                <Price
                  amount={price.amount}
                  currencyCode={price.currencyCode}
                  className="text-neutral-900 font-semibold text-base"
                />
              </div>
            </div>
          </a>
        ) : (
          <Link href={`/product/${handle}`} className="flex flex-col h-full">
            {/* Image Container */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-50">
              {/* Badges */}
              <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                {!availableForSale && (
                  <span className="bg-neutral-900 text-white px-3 py-1 text-xs font-medium uppercase tracking-wider rounded-sm">
                    Sold Out
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <m.button
                onClick={handleWishlist}
                className={cn(
                  "absolute top-3 right-3 z-20 p-2 rounded-full",
                  "bg-white/80 backdrop-blur-sm shadow-sm",
                  "transition-all duration-300",
                  "opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0",
                  "hover:bg-white hover:scale-110",
                  "md:opacity-0 md:translate-y-2",
                  // On mobile, always show
                  "max-md:opacity-100 max-md:translate-y-0"
                )}
                whileTap={{ scale: 0.9 }}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isWishlisted
                      ? "fill-red-500 text-red-500"
                      : "text-neutral-600 hover:text-red-500"
                  )}
                />
              </m.button>

              {/* Product Image with 3D depth effect */}
              {featuredImage ? (
                <m.div
                  className="h-full w-full"
                  style={{
                    translateZ: enable3DTilt ? 50 : 0,
                  }}
                  variants={cardImageVariants}
                  initial="rest"
                  whileHover="hover"
                >
                  <Image
                    src={featuredImage.url}
                    alt={featuredImage.altText || title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                    priority={priority}
                    className={cn(
                      "object-cover transition-all duration-700",
                      imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
                    )}
                    onLoad={() => setImageLoaded(true)}
                  />
                </m.div>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-100">
                  <span className="text-neutral-400 text-sm">No Image</span>
                </div>
              )}

              {/* Skeleton Shimmer */}
              {!imageLoaded && featuredImage && (
                <div className="skeleton-gold absolute inset-0 z-10" />
              )}

              {/* Hover Actions Overlay */}
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 z-20 p-4",
                  "bg-gradient-to-t from-black/60 via-black/30 to-transparent",
                  "transition-all duration-300 ease-out",
                  "opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0",
                  "md:opacity-0 md:translate-y-4",
                  // Mobile: always visible
                  "max-md:opacity-100 max-md:translate-y-0 max-md:bg-gradient-to-t max-md:from-black/40 max-md:via-transparent max-md:to-transparent"
                )}
              >
                <div className="flex gap-2">
                  {/* Quick Add Button */}
                  {onQuickAdd && availableForSale && (
                    <m.button
                      onClick={handleQuickAdd}
                      disabled={isAddingToCart}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 px-4",
                        "bg-white text-black text-sm font-medium",
                        "rounded-lg shadow-lg",
                        "transition-all duration-300",
                        "hover:bg-[var(--atp-gold)] hover:text-black",
                        "disabled:opacity-70 disabled:cursor-not-allowed"
                      )}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isAddingToCart ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </m.button>
                  )}

                  {/* Quick View Button */}
                  {onQuickView && (
                    <m.button
                      onClick={handleQuickView}
                      className={cn(
                        "p-3 bg-white/90 backdrop-blur-sm text-black",
                        "rounded-lg shadow-lg",
                        "transition-all duration-300",
                        "hover:bg-[var(--atp-gold)]"
                      )}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Quick view"
                    >
                      <Eye className="w-4 h-4" />
                    </m.button>
                  )}
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div
              className={cn(
                "flex flex-col gap-2 p-4 flex-grow",
                isRTL ? "text-right" : "text-left"
              )}
            >
              {/* Rating */}
              {showRating && typeof rating === "number" && Number.isFinite(rating) && rating >= 0 && rating <= 5 && reviewCount > 0 && (
                <div
                  className={cn(
                    "flex items-center gap-1.5",
                    isRTL && "flex-row-reverse justify-end"
                  )}
                >
                  <div className="flex">{renderStars()}</div>
                  <span className="text-xs text-neutral-500">({reviewCount})</span>
                </div>
              )}

              {/* Title */}
              <h3 className="font-medium text-neutral-900 text-sm md:text-base leading-snug line-clamp-2 min-h-[2.5em]">
                {title}
              </h3>

              {/* Price */}
              <div
                className={cn(
                  "flex items-center gap-2 mt-auto",
                  isRTL && "flex-row-reverse justify-end"
                )}
              >
                <Price
                  amount={price.amount}
                  currencyCode={price.currencyCode}
                  className="text-neutral-900 font-semibold text-base"
                />
              </div>
            </div>
          </Link>
        )}
      </m.div>

      {/* Subtle gold glow on hover */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl pointer-events-none",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          "shadow-[inset_0_0_0_1px_var(--atp-gold),0_0_30px_-5px_var(--atp-gold)]"
        )}
      />
    </m.div>
  );
}
