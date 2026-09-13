"use client";

/**
 * PageTransition Component
 * 
 * Award-winning page transition wrapper for ATP Trading.
 * Uses Framer Motion for smooth enter/exit animations.
 * 
 * Note: In Next.js App Router, AnimatePresence cannot detect route changes
 * automatically. This component provides enter animations and can be enhanced
 * with layout animations via layoutId for shared element transitions.
 */

import { ReactNode } from "react";
import { m, useReducedMotion } from "framer-motion";
import { easing } from "@/lib/animations/variants";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  /** Animation variant: 'fade', 'slideUp', 'slideLeft', 'scale' */
  variant?: "fade" | "slideUp" | "slideLeft" | "scale" | "blur";
  /** Delay before animation starts */
  delay?: number;
}

const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  },
  blur: {
    initial: { opacity: 0, filter: "blur(10px)" },
    animate: { opacity: 1, filter: "blur(0px)" },
    exit: { opacity: 0, filter: "blur(5px)" },
  },
};

export function PageTransition({
  children,
  className,
  variant = "slideUp",
  delay = 0,
}: PageTransitionProps) {
  const prefersReducedMotion = useReducedMotion();
  const selectedVariant = variants[variant];

  // Use simplified animation for reduced motion preference
  const motionVariants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : selectedVariant;

  return (
    <m.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={motionVariants}
      transition={{
        duration: prefersReducedMotion ? 0.1 : 0.5,
        ease: easing.smooth,
        delay,
      }}
      className={className}
    >
      {children}
    </m.div>
  );
}

/**
 * SectionTransition Component
 * 
 * For individual section animations within a page.
 * Triggers when section enters viewport.
 */
interface SectionTransitionProps {
  children: ReactNode;
  className?: string;
  /** Animation variant */
  variant?: "fade" | "slideUp" | "slideLeft" | "scale";
  /** Delay before animation */
  delay?: number;
  /** Viewport amount required to trigger (0-1) */
  amount?: number;
}

export function SectionTransition({
  children,
  className,
  variant = "slideUp",
  delay = 0,
  amount = 0.2,
}: SectionTransitionProps) {
  const prefersReducedMotion = useReducedMotion();
  const selectedVariant = variants[variant];

  const motionVariants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
      }
    : {
        initial: selectedVariant.initial,
        whileInView: selectedVariant.animate,
      };

  return (
    <m.div
      {...motionVariants}
      viewport={{ once: true, amount }}
      transition={{
        duration: prefersReducedMotion ? 0.1 : 0.6,
        ease: easing.smooth,
        delay,
      }}
      className={className}
    >
      {children}
    </m.div>
  );
}

/**
 * StaggerContainer Component
 * 
 * Container for staggered children animations.
 */
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  /** Delay between each child */
  staggerDelay?: number;
  /** Initial delay before first child */
  initialDelay?: number;
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
  initialDelay = 0.1,
}: StaggerContainerProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <m.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
            delayChildren: prefersReducedMotion ? 0 : initialDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </m.div>
  );
}

/**
 * StaggerItem Component
 * 
 * Child of StaggerContainer for individual item animations.
 */
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <m.div
      variants={{
        hidden: prefersReducedMotion 
          ? { opacity: 0 } 
          : { opacity: 0, y: 20 },
        visible: prefersReducedMotion 
          ? { opacity: 1 } 
          : { opacity: 1, y: 0 },
      }}
      transition={{
        duration: prefersReducedMotion ? 0.1 : 0.4,
        ease: easing.smooth,
      }}
      className={className}
    >
      {children}
    </m.div>
  );
}
