"use client";

/**
 * PageTransitionProvider
 * 
 * Keep one route subtree mounted. Exit animations must not retain App Router
 * content (including its metadata) after navigation.
 */

import { type ReactNode, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();

  useLayoutEffect(() => {
    // Explicit section links retain their anchor destination.
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return (
    <div className={className}>
      {children}
    </div>
  );
}
