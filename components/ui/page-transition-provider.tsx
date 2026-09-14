"use client";

/**
 * PageTransitionProvider
 * 
 * Keep one route subtree mounted. Exit animations must not retain App Router
 * content (including its metadata) after navigation.
 */

import { type ReactNode } from "react";
import { PageTransition } from "@/components/ui/page-transition";

interface PageTransitionProviderProps {
  children: ReactNode;
  className?: string;
  variant?: "fade" | "slideUp" | "slideLeft" | "scale" | "blur";
}

export function PageTransitionProvider({
  children,
  className,
  variant = "slideUp",
}: PageTransitionProviderProps) {
  return (
    <PageTransition variant={variant} className={className}>
        {children}
    </PageTransition>
  );
}
