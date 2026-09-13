"use client";

/**
 * FreeShippingProgress Component
 * 
 * Animated progress bar showing distance to free shipping threshold.
 * Uses spring physics for smooth animations.
 * 
 * Part of ATP Trading luxury e-commerce redesign.
 */

import { m, useReducedMotion } from "framer-motion";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { transitions } from "@/lib/animations/variants";
import { useTranslations } from "next-intl";
import { useRTL } from "@/hooks/use-rtl";
import { Package, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FreeShippingProgressProps {
  currentTotal: number;
  threshold?: number;
  currency?: string;
  className?: string;
}

export function FreeShippingProgress({
  currentTotal,
  threshold = 250,
  currency = "AED",
  className,
}: FreeShippingProgressProps) {
  const t = useTranslations("cart");
  const { isRTL } = useRTL();
  const prefersReducedMotion = useReducedMotion();
  
  const progress = Math.min((currentTotal / threshold) * 100, 100);
  const remaining = Math.max(threshold - currentTotal, 0);
  const isComplete = currentTotal >= threshold;

  return (
    <div 
      className={cn(
        "mb-4 p-4 rounded-xl border transition-colors duration-300",
        isComplete 
          ? "bg-atp-gold/10 border-atp-gold/30" 
          : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800",
        className
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center gap-2 mb-3",
        isRTL && "flex-row-reverse"
      )}>
        {isComplete ? (
          <m.div
            initial={prefersReducedMotion ? {} : { scale: 0, rotate: -180 }}
            animate={prefersReducedMotion ? {} : { scale: 1, rotate: 0 }}
            transition={transitions.springBouncy}
          >
            <Sparkles className="w-5 h-5 text-atp-gold" />
          </m.div>
        ) : (
          <Package className="w-5 h-5 text-muted-foreground" />
        )}
        
        <span className={cn(
          "text-sm font-medium",
          isComplete ? "text-atp-gold" : "text-foreground"
        )}>
          {isComplete 
            ? t("freeShippingUnlocked")
            : (
              <span className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
                <AnimatedCounter 
                  value={remaining} 
                  className="font-bold text-atp-gold"
                />
                <span>{currency}</span>
                <span>{t("awayFromFreeShipping")}</span>
              </span>
            )
          }
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
        <m.div
          className={cn(
            "h-full rounded-full relative",
            isComplete 
              ? "bg-atp-gold" 
              : "bg-gradient-to-r from-atp-gold/60 via-atp-gold to-atp-gold/60"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={prefersReducedMotion ? { duration: 0 } : transitions.spring}
        >
          {/* Shine effect on complete */}
          {isComplete && !prefersReducedMotion && (
            <m.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut",
              }}
            />
          )}
        </m.div>
      </div>
      
      {/* Progress Text */}
      <div className={cn(
        "flex justify-between mt-2 text-xs text-muted-foreground",
        isRTL && "flex-row-reverse"
      )}>
        <span>
          {currency} {currentTotal.toFixed(0)}
        </span>
        <span>
          {currency} {threshold}
        </span>
      </div>
    </div>
  );
}
