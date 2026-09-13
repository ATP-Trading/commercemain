"use client";

/**
 * BackToTop Component
 * 
 * Award-winning back-to-top button for ATP Trading.
 * Features:
 * - Smooth scroll with configurable threshold
 * - Elegant fade/slide animations
 * - RTL support
 * - Reduced motion support
 * - Progress indicator showing scroll position
 * - Luxurious gold accent styling
 */

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import { easing } from "@/lib/animations/variants";

interface BackToTopProps {
  /** Scroll threshold in pixels before showing button */
  threshold?: number;
  /** Show scroll progress ring */
  showProgress?: boolean;
  /** Custom className */
  className?: string;
}

export function BackToTop({ 
  threshold = 400, 
  showProgress = true,
  className 
}: BackToTopProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [isMounted, setIsMounted] = useState(false);

  // Calculate scroll progress and visibility
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    
    setScrollProgress(progress);
    setIsVisible(scrollTop > threshold);
  }, [threshold]);

  useEffect(() => {
    setIsMounted(true);
    // Initial check
    handleScroll();
    
    // Throttled scroll listener
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [handleScroll]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [prefersReducedMotion]);

  if (!isMounted) {
    return null;
  }

  // SVG circle properties for progress ring
  const size = 48;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  const button = (
    <AnimatePresence>
      {isVisible && (
        <m.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3, ease: easing.smooth }}
          onClick={scrollToTop}
          className={cn(
            "fixed z-50 group",
            isRTL ? "left-6 right-auto" : "right-6 left-auto",
            "bottom-24 md:bottom-8",
            className
          )}
          aria-label={isRTL ? "العودة إلى الأعلى" : "Back to top"}
        >
          {/* Main button */}
          <div className="relative flex items-center justify-center w-12 h-12">
            {/* Progress ring */}
            {showProgress && (
              <svg
                className="absolute inset-0 -rotate-90 transform"
                width={size}
                height={size}
              >
                {/* Background circle */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="text-atp-light-gray"
                />
                {/* Progress circle */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="text-atp-gold transition-all duration-300"
                />
              </svg>
            )}

            {/* Button background */}
            <m.div
              className={cn(
                "absolute inset-1 rounded-full",
                "bg-atp-black shadow-lg",
                "group-hover:bg-atp-charcoal transition-colors duration-300",
                "border border-atp-gold/20 group-hover:border-atp-gold/50"
              )}
            />

            {/* Arrow icon */}
            <m.div
              animate={prefersReducedMotion ? {} : { y: [0, -2, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
              }}
              className="relative z-10"
            >
              <ArrowUp className="w-5 h-5 text-atp-gold group-hover:text-white transition-colors duration-300" />
            </m.div>
          </div>

          {/* Tooltip on hover */}
          <m.span
            initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
            whileHover={{ opacity: 1, x: 0 }}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 whitespace-nowrap",
              "bg-atp-black text-white text-xs px-3 py-1.5 rounded-md",
              "pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity",
              "hidden md:block",
              isRTL ? "left-14" : "right-14"
            )}
          >
            {isRTL ? "العودة إلى الأعلى" : "Back to top"}
          </m.span>
        </m.button>
      )}
    </AnimatePresence>
  );

  return createPortal(button, document.body);
}
