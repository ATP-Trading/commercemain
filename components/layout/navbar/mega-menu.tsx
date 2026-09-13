"use client";

/**
 * MegaMenu Component
 * 
 * Award-winning mega menu for ATP Trading navigation.
 * Features:
 * - Full-width dropdown with categories and products
 * - Featured product spotlight
 * - Promotional banner
 * - RTL support
 * - Smooth animations
 * - Keyboard navigation
 */

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Sparkles, ArrowRight, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRTL } from "@/hooks/use-rtl";
import { DirhamSymbol } from "@/components/icons/dirham-symbol";
import { getLocalizedProductHandle, getLocalizedProductTitle } from "@/lib/shopify/i18n-queries";
import { menuVariants, easing } from "@/lib/animations/variants";
import type { Product } from "@/lib/shopify/types";

// Menu category configuration
interface MenuCategory {
  id: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  href: string;
  icon?: ReactNode;
  featured?: boolean;
  subcategories?: {
    title: string;
    titleAr?: string;
    href: string;
  }[];
}

interface MegaMenuProps {
  category: MenuCategory;
  products: Product[];
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  locale: string;
}

export function MegaMenu({
  category,
  products,
  isLoading,
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
  locale,
}: MegaMenuProps) {
  const { isRTL } = useRTL();
  const prefersReducedMotion = useReducedMotion();
  const menuRef = useRef<HTMLDivElement>(null);

  const categoryTitle = isRTL ? (category.titleAr || category.title) : category.title;
  const categoryDescription = isRTL
    ? (category.descriptionAr || category.description)
    : category.description;
  const resolvedDescription = categoryDescription || (isRTL ? `استكشف ${categoryTitle}` : `Explore ${categoryTitle}`);

  const withLocale = useCallback((path: string) => {
    if (path.startsWith("http") || path.startsWith("mailto:") || path.startsWith("#")) {
      return path;
    }
    if (path.startsWith(`/${locale}`)) {
      return path;
    }
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return `/${locale}${normalized}`;
  }, [locale]);

  // Featured product (first product with highest price or first available)
  const featuredProduct = products[0];
  const regularProducts = products.slice(1, 5);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          ref={menuRef}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={prefersReducedMotion ? {
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
            exit: { opacity: 0 },
          } : menuVariants}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25, ease: easing.smooth }}
          className="absolute top-full left-0 right-0 w-screen bg-gradient-to-b from-atp-black via-neutral-950 to-atp-black border-t border-atp-gold/20 shadow-2xl"
          style={{ marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)" }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave ?? onClose}
        >
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className={cn(
              "grid gap-8",
              featuredProduct ? "grid-cols-12" : "grid-cols-1"
            )}>
              {/* Left side: Categories and subcategories */}
              <div className={cn(
                "space-y-6",
                featuredProduct ? "col-span-3" : "col-span-12"
              )}>
                {/* Category header */}
                <div className="border-b border-neutral-800 pb-4">
                  <h3 className={cn(
                    "text-lg font-serif text-atp-gold mb-1",
                    isRTL && "font-arabic text-right"
                  )}>
                    {categoryTitle}
                  </h3>
                  <p className={cn(
                    "text-sm text-neutral-400",
                    isRTL && "font-arabic text-right"
                  )}>
                    {resolvedDescription}
                  </p>
                </div>

                {/* Subcategories */}
                {category.subcategories && category.subcategories.length > 0 && (
                  <ul className="space-y-2">
                    {category.subcategories.map((sub) => (
                      <li key={sub.href}>
                        <Link
                          href={withLocale(sub.href)}
                          className={cn(
                            "flex items-center gap-2 py-2 px-3 rounded-lg text-sm text-neutral-300 hover:text-white hover:bg-neutral-800/50 transition-colors group",
                            isRTL && "flex-row-reverse font-arabic"
                          )}
                          onClick={onClose}
                        >
                          <ChevronRight className={cn(
                            "w-4 h-4 text-atp-gold opacity-0 group-hover:opacity-100 transition-opacity",
                            isRTL && "rotate-180"
                          )} />
                          <span>{isRTL ? (sub.titleAr || sub.title) : sub.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                {/* View all link */}
                <Link
                  href={withLocale(category.href)}
                  className={cn(
                    "inline-flex items-center gap-2 text-sm font-medium text-atp-gold hover:text-white transition-colors group",
                    isRTL && "flex-row-reverse"
                  )}
                  onClick={onClose}
                >
                  <span>{isRTL ? "عرض الكل" : "View All"}</span>
                  <ArrowRight className={cn(
                    "w-4 h-4 group-hover:translate-x-1 transition-transform",
                    isRTL && "rotate-180 group-hover:-translate-x-1"
                  )} />
                </Link>
              </div>

              {/* Center: Product grid */}
              {(products.length > 0 || isLoading) && (
                <div className="col-span-6">
                  <h4 className={cn(
                    "text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4",
                    isRTL && "text-right"
                  )}>
                    {isRTL ? "المنتجات المميزة" : "Featured Products"}
                  </h4>

                  {isLoading ? (
                    <div className="grid grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-3">
                          <div className="aspect-square bg-neutral-800 rounded-xl animate-pulse" />
                          <div className="h-3 bg-neutral-800 rounded animate-pulse" />
                          <div className="h-3 bg-neutral-800 rounded w-2/3 animate-pulse" />
                        </div>
                      ))}
                    </div>
                  ) : (
                                    <div className="grid grid-cols-4 gap-4">
                                      {regularProducts.map((product) => {
                                        const productHandle = getLocalizedProductHandle(
                                          product,
                                          locale as "en" | "ar"
                                        );
                                        const productTitle = getLocalizedProductTitle(
                                          product,
                                          locale as "en" | "ar"
                                        );
                                        return (
                                        <Link
                                          key={product.id}
                                          href={withLocale(`/product/${productHandle}`)}
                                          className="group"
                                          onClick={onClose}
                                        >
                                          <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-900 ring-1 ring-neutral-800 group-hover:ring-atp-gold/50 transition-all duration-300">
                                            {product.featuredImage?.url && (
                                              <Image
                                                src={product.featuredImage.url}
                                                alt={productTitle}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 768px) 25vw, 150px"
                                              />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                          </div>
                                          <h5 className={cn(
                                            "mt-3 text-xs text-neutral-300 group-hover:text-white line-clamp-2 transition-colors",
                                            isRTL && "text-right font-arabic"
                                          )}>
                                            {productTitle}
                                          </h5>
                          <div className={cn(
                            "flex items-center gap-1 mt-1 text-atp-gold text-sm font-medium",
                            isRTL && "flex-row-reverse"
                          )}>
                            <DirhamSymbol className="w-3 h-3" />
                            <span>
                              {parseFloat(product.priceRange.minVariantPrice.amount).toFixed(0)}
                            </span>
                          </div>
                        </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Right side: Featured product spotlight */}
              {featuredProduct && !isLoading && (() => {
                const featuredProductTitle = getLocalizedProductTitle(
                  featuredProduct,
                  locale as "en" | "ar"
                );
                return (
                <div className="col-span-3">
                  <div className="relative h-full rounded-2xl overflow-hidden bg-gradient-to-br from-atp-gold/10 to-transparent border border-atp-gold/20">
                    {/* Featured badge */}
                    <div className={cn(
                      "absolute top-4 z-10 flex items-center gap-1.5 bg-atp-gold text-atp-black text-xs font-bold px-3 py-1.5 rounded-full",
                      isRTL ? "right-4" : "left-4"
                    )}>
                      <Sparkles className="w-3 h-3" />
                      <span>{isRTL ? "مميز" : "Featured"}</span>
                    </div>

                    {/* Product image */}
                    <div className="relative h-48">
                      {featuredProduct.featuredImage?.url && (
                        <Image
                          src={featuredProduct.featuredImage.url}
                          alt={featuredProductTitle}
                          fill
                          className="object-cover"
                          sizes="300px"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-atp-black via-atp-black/50 to-transparent" />
                    </div>

                    {/* Product info */}
                    <div className={cn("p-4 space-y-3", isRTL && "text-right")}>
                      <h4 className={cn(
                        "text-white font-medium line-clamp-2",
                        isRTL && "font-arabic"
                      )}>
                        {featuredProductTitle}
                      </h4>
                      
                      <div className={cn(
                        "flex items-center gap-2",
                        isRTL && "flex-row-reverse"
                      )}>
                        <div className="flex items-center gap-1 text-atp-gold text-lg font-bold">
                          <DirhamSymbol className="w-4 h-4" />
                          <span>
                            {parseFloat(featuredProduct.priceRange.minVariantPrice.amount).toFixed(0)}
                          </span>
                        </div>
                        {featuredProduct.priceRange.maxVariantPrice.amount !== featuredProduct.priceRange.minVariantPrice.amount && (
                          <span className="text-xs text-neutral-500 line-through">
                            {parseFloat(featuredProduct.priceRange.maxVariantPrice.amount).toFixed(0)}
                          </span>
                        )}
                      </div>

                      <Link
                        href={withLocale(
                          `/product/${getLocalizedProductHandle(
                            featuredProduct,
                            locale as "en" | "ar"
                          )}`
                        )}
                        className={cn(
                          "flex items-center justify-center gap-2 w-full py-2.5 bg-atp-gold text-atp-black text-sm font-medium rounded-lg hover:bg-white transition-colors",
                          isRTL && "flex-row-reverse"
                        )}
                        onClick={onClose}
                      >
                        <span>{isRTL ? "تسوق الآن" : "Shop Now"}</span>
                        <ArrowRight className={cn("w-4 h-4", isRTL && "rotate-180")} />
                      </Link>
                    </div>
                  </div>
                </div>
                );
              })()}
            </div>

            {/* Promotional banner */}
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className={cn(
                "mt-6 p-4 rounded-xl bg-gradient-to-r from-atp-gold/10 via-transparent to-atp-gold/10 border border-atp-gold/20 flex items-center justify-between",
                isRTL && "flex-row-reverse"
              )}
            >
              <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                <div className="w-10 h-10 rounded-full bg-atp-gold/20 flex items-center justify-center">
                  <Tag className="w-5 h-5 text-atp-gold" />
                </div>
                <div className={isRTL ? "text-right" : ""}>
                  <p className={cn("text-white font-medium", isRTL && "font-arabic")}>
                    {isRTL ? "عرض خاص للأعضاء" : "ATP Member Exclusive"}
                  </p>
                  <p className={cn("text-sm text-neutral-400", isRTL && "font-arabic")}>
                    {isRTL ? "احصل على خصم 15% على جميع المنتجات" : "Get 15% off on all products"}
                  </p>
                </div>
              </div>
              <Link
                href={withLocale("/atp-membership")}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium text-atp-gold hover:text-white transition-colors",
                  isRTL && "flex-row-reverse"
                )}
                onClick={onClose}
              >
                <span>{isRTL ? "انضم الآن" : "Join Now"}</span>
                <ArrowRight className={cn("w-4 h-4", isRTL && "rotate-180")} />
              </Link>
            </m.div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

// Default menu categories configuration
export const menuCategories: MenuCategory[] = [
  {
    id: "atp-membership",
    title: "ATP Membership",
    titleAr: "عضوية ATP",
    description: "Exclusive wellness benefits and privileges",
    descriptionAr: "مزايا وامتيازات العافية الحصرية",
    href: "/atp-membership",
    subcategories: [
      { title: "Membership Benefits", titleAr: "مزايا العضوية", href: "/atp-membership#benefits" },
      { title: "Plans & Pricing", titleAr: "الخطط والأسعار", href: "/atp-membership#plans" },
      { title: "Corporate Membership", titleAr: "عضوية الشركات", href: "/atp-membership#corporate" },
    ],
  },
  {
    id: "skincare-supplements",
    title: "Skincare & Supplements",
    titleAr: "العناية بالبشرة والمكملات",
    description: "Premium Thai beauty products",
    descriptionAr: "منتجات تجميل تايلندية فاخرة",
    href: "/collections/skincare-supplements",
    subcategories: [
      { title: "Face Care", titleAr: "العناية بالوجه", href: "/collections/skincare-supplements?category=face" },
      { title: "Body Care", titleAr: "العناية بالجسم", href: "/collections/skincare-supplements?category=body" },
      { title: "Supplements", titleAr: "المكملات", href: "/collections/skincare-supplements?category=supplements" },
      { title: "Anti-Aging", titleAr: "مكافحة الشيخوخة", href: "/collections/skincare-supplements?category=anti-aging" },
    ],
  },
  {
    id: "water-soil-technology",
    title: "Water & Soil Technology",
    titleAr: "تكنولوجيا المياه والتربة",
    description: "Advanced environmental solutions",
    descriptionAr: "حلول بيئية متقدمة",
    href: "/water-soil-technology",
    subcategories: [
      { title: "Water Treatment", titleAr: "معالجة المياه", href: "/water-soil-technology?category=water" },
      { title: "Soil Enhancement", titleAr: "تحسين التربة", href: "/water-soil-technology?category=soil" },
      { title: "Agricultural", titleAr: "الزراعة", href: "/water-soil-technology?category=agricultural" },
    ],
  },

];
