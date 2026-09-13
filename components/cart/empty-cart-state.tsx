"use client";

/**
 * EmptyCartState Component
 * 
 * Animated empty cart state with staggered reveal.
 * Uses FloatingElement for the cart icon and MagneticButton for CTA.
 * 
 * Part of ATP Trading luxury e-commerce redesign.
 */

import { m, useReducedMotion } from "framer-motion";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { 
  containerSlowVariants, 
  itemVariants,
  transitions 
} from "@/lib/animations/variants";
import { FloatingElement } from "@/components/ui/floating-element";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { useTranslations } from "next-intl";
import { useRTL } from "@/hooks/use-rtl";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Link } from "@/src/i18n/navigation";

interface EmptyCartStateProps {
  onClose: () => void;
}

export function EmptyCartState({ onClose }: EmptyCartStateProps) {
  const t = useTranslations("cart");
  const tNav = useTranslations("navbar");
  const { isRTL } = useRTL();
  const locale = useLocale();
  const prefersReducedMotion = useReducedMotion();

  // Category suggestions with translations
  const categories = [
    { key: "emsTraining", href: "/collections/ems-training" },
    { key: "skincareSupplements", href: "/collections/skincare-supplements" },
  ];

  // Use static variants if user prefers reduced motion
  const containerVars = prefersReducedMotion 
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : containerSlowVariants;
    
  const itemVars = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : itemVariants;

  return (
    <m.div
      variants={containerVars}
      initial="hidden"
      animate="visible"
      className={cn(
        "mt-16 flex w-full flex-col items-center justify-center overflow-hidden px-4",
        isRTL && "text-right"
      )}
    >
      {/* Animated Cart Icon */}
      <m.div variants={itemVars} className="relative">
        {prefersReducedMotion ? (
          <div className="relative">
            <ShoppingCart className="h-20 w-20 text-neutral-200 dark:text-neutral-700" strokeWidth={1} />
            <div className="absolute -right-1 -top-1 w-4 h-4 rounded-full bg-atp-gold/20" />
          </div>
        ) : (
          <FloatingElement range={8} duration={4}>
            <div className="relative">
              <ShoppingCart className="h-20 w-20 text-neutral-200 dark:text-neutral-700" strokeWidth={1} />
              {/* Decorative dot */}
              <m.div 
                className="absolute -right-1 -top-1 w-4 h-4 rounded-full bg-atp-gold/20"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </FloatingElement>
        )}
      </m.div>
      
      {/* Title */}
      <m.h2 
        variants={itemVars} 
        className="mt-8 text-center text-2xl font-semibold text-foreground"
      >
        {t("yourCartIsEmpty")}
      </m.h2>
      
      {/* Subtitle */}
      <m.p 
        variants={itemVars} 
        className="mt-3 text-center text-sm text-muted-foreground max-w-xs"
      >
        {t("startAddingItems")}
      </m.p>
      
      {/* CTA Button */}
      <m.div variants={itemVars} className="mt-8">
        <Link href="/collections" onClick={onClose}>
          <MagneticButton
            variant="gold"
            className="group"
          >
            <span className={cn(
              "flex items-center gap-2",
              isRTL && "flex-row-reverse"
            )}>
              {t("continueShopping")}
              <ArrowRight 
                className={cn(
                  "w-4 h-4 transition-transform group-hover:translate-x-1",
                  isRTL && "rotate-180 group-hover:-translate-x-1"
                )} 
              />
            </span>
          </MagneticButton>
        </Link>
      </m.div>
      
      {/* Browse suggestions */}
      <m.div 
        variants={itemVars}
        className={cn(
          "mt-8 flex flex-wrap justify-center gap-2",
          isRTL && "flex-row-reverse"
        )}
      >
        {categories.map((category) => (
          <Link
            key={category.key}
            href={category.href}
            onClick={onClose}
            className="px-3 py-1.5 text-xs rounded-full border border-neutral-200 dark:border-neutral-700 text-muted-foreground hover:border-atp-gold hover:text-atp-gold transition-colors"
          >
            {tNav(category.key)}
          </Link>
        ))}
      </m.div>
    </m.div>
  );
}
