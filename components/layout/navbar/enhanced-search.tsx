"use client";

import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { useTranslations } from "@/hooks/use-translations";
import { useLocale } from 'next-intl';
import Image from "next/image";
import Link from "next/link";
import Price from "@/components/price";

interface SearchSuggestion {
  id: string;
  query: string;
  type: "history" | "suggestion";
  category?: string;
}

interface ProductResult {
  id: string;
  handle: string;
  title: string;
  featuredImage?: { url: string; altText?: string };
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
}

interface EnhancedSearchProps {
  placeholder?: string;
  className?: string;
  onClose?: () => void;
  autoFocus?: boolean;
}

export default function EnhancedSearch({
  placeholder = "Search for products...",
  className = "",
  onClose,
  autoFocus = false,
}: EnhancedSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const { t } = useTranslations();
  const [query, setQuery] = useState(searchParams?.get("q") || "");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [productResults, setProductResults] = useState<ProductResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Safe translation helper with fallback
  const safeT = (key: string, params?: Record<string, string | number>, fallback?: string): string => {
    try {
      const result = t(key, params);
      return typeof result === 'string' ? result : fallback || key;
    } catch {
      return fallback || key;
    }
  };

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem("search-history");
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Auto focus when component mounts if autoFocus is true
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  // Debounced search suggestions with Context7 integration
  const fetchSuggestions = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);

      try {
        // First try to fetch from our API
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}&limit=5`
        );
        const data = await response.json();

        // Extract product results for visual display
        if (data.products && data.products.length > 0) {
          setProductResults(data.products.slice(0, 4).map((p: ProductResult) => ({
            id: p.id,
            handle: p.handle,
            title: p.title,
            featuredImage: p.featuredImage,
            priceRange: p.priceRange,
          })));
        } else {
          setProductResults([]);
        }

        let apiSuggestions: SearchSuggestion[] = [];

        if (data.suggestions && data.suggestions.length > 0) {
          apiSuggestions = data.suggestions
            .slice(0, 4)
            .map((suggestion: string, i: number) => ({
              id: `api-${i}`,
              query: suggestion,
              type: "suggestion" as const,
              category: getCategoryFromQuery(suggestion),
            }));
        } else {
          // Enhanced fallback suggestions using Context7-inspired intelligent matching
          const intelligentSuggestions =
            generateIntelligentSuggestions(searchQuery);
          apiSuggestions = intelligentSuggestions
            .slice(0, 4)
            .map((suggestion, i) => ({
              id: `intelligent-${i}`,
              query: suggestion.query,
              type: "suggestion" as const,
              category: suggestion.category,
            }));
        }

        // Add recent searches that match
        const matchingHistory = searchHistory
          .filter((h) => h.toLowerCase().includes(searchQuery.toLowerCase()))
          .slice(0, 3)
          .map((h, i) => ({
            id: `history-${i}`,
            query: h,
            type: "history" as const,
          }));

        setSuggestions([...matchingHistory, ...apiSuggestions]);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);

        // Enhanced fallback with intelligent suggestions
        const intelligentSuggestions =
          generateIntelligentSuggestions(searchQuery);
        const mockSuggestions = intelligentSuggestions.map((suggestion, i) => ({
          id: `fallback-${i}`,
          query: suggestion.query,
          type: "suggestion" as const,
          category: suggestion.category,
        }));

        const matchingHistory = searchHistory
          .filter((h) => h.toLowerCase().includes(searchQuery.toLowerCase()))
          .slice(0, 3)
          .map((h, i) => ({
            id: `history-${i}`,
            query: h,
            type: "history" as const,
          }));

        setSuggestions([...matchingHistory, ...mockSuggestions]);
      }

      setIsLoading(false);
    },
    [searchHistory]
  );

  // Generate intelligent suggestions based on query context
  const generateIntelligentSuggestions = (query: string) => {
    const lowerQuery = query.toLowerCase();
    const suggestions = [];

    // ATP Membership related
    if (
      lowerQuery.includes("atp") ||
      lowerQuery.includes("member") ||
      lowerQuery.includes("premium")
    ) {
      suggestions.push({
        query: `${query} membership benefits`,
        category: "ATP Membership",
      });
      suggestions.push({
        query: `${query} premium package`,
        category: "ATP Membership",
      });
    }

    // Skincare related
    if (
      lowerQuery.includes("skin") ||
      lowerQuery.includes("face") ||
      lowerQuery.includes("beauty")
    ) {
      suggestions.push({ query: `${query} serum`, category: "Skincare" });
      suggestions.push({ query: `${query} cream`, category: "Skincare" });
      suggestions.push({ query: `${query} cleanser`, category: "Skincare" });
    }

    // Wellness/Supplements related
    if (
      lowerQuery.includes("vitamin") ||
      lowerQuery.includes("supplement") ||
      lowerQuery.includes("health")
    ) {
      suggestions.push({ query: `${query} supplements`, category: "Wellness" });
      suggestions.push({ query: `${query} vitamins`, category: "Wellness" });
    }

    // Technology related
    if (
      lowerQuery.includes("water") ||
      lowerQuery.includes("soil") ||
      lowerQuery.includes("tech")
    ) {
      suggestions.push({
        query: `${query} technology solutions`,
        category: "Technology",
      });
      suggestions.push({ query: `${query} equipment`, category: "Technology" });
    }

    // General product suggestions if no specific category matches
    if (suggestions.length === 0) {
      suggestions.push(
        { query: `${query} products`, category: "General" },
        { query: `${query} solutions`, category: "General" },
        { query: `${query} services`, category: "General" },
        { query: `${query} packages`, category: "General" }
      );
    }

    return suggestions.slice(0, 4);
  };

  // Helper function to categorize suggestions
  const getCategoryFromQuery = (query: string): string | undefined => {
    const lowerQuery = query.toLowerCase();
    if (
      lowerQuery.includes("serum") ||
      lowerQuery.includes("cream") ||
      lowerQuery.includes("skincare")
    ) {
      return "Skincare";
    }
    if (
      lowerQuery.includes("supplement") ||
      lowerQuery.includes("vitamin") ||
      lowerQuery.includes("wellness")
    ) {
      return "Wellness";
    }
    if (
      lowerQuery.includes("ems") ||
      lowerQuery.includes("equipment") ||
      lowerQuery.includes("training")
    ) {
      return "EMS";
    }
    if (
      lowerQuery.includes("water") ||
      lowerQuery.includes("soil") ||
      lowerQuery.includes("technology")
    ) {
      return "Technology";
    }
    return undefined;
  };

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  // Handle search submission
  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Add to search history
    const updatedHistory = [
      searchQuery,
      ...searchHistory.filter((h) => h !== searchQuery),
    ].slice(0, 10); // Keep only last 10 searches

    setSearchHistory(updatedHistory);
    localStorage.setItem("search-history", JSON.stringify(updatedHistory));

    // Navigate to search page
    router.push(`/${locale}/search?q=${encodeURIComponent(searchQuery)}`);
    setIsOpen(false);
    inputRef.current?.blur();

    // Close the search bar if onClose is provided
    if (onClose) {
      onClose();
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.query);
    handleSearch(suggestion.query);
  };

  // Clear search history
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("search-history");
    setSuggestions((prev) => prev.filter((s) => s.type !== "history"));
  };

  // Handle focus/blur
  const handleFocus = () => {
    setIsOpen(true);
    if (query) {
      fetchSuggestions(query);
    } else {
      // Show recent searches when focused without query
      const recentSuggestions = searchHistory.slice(0, 5).map((h, i) => ({
        id: `recent-${i}`,
        query: h,
        type: "history" as const,
      }));
      setSuggestions(recentSuggestions);
    }
  };

  const handleBlur = () => {
    // Delay closing to allow for suggestion clicks
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-lg border bg-white px-4 py-2 pr-10 text-black placeholder:text-neutral-500 focus:border-atp-gold focus:outline-none focus:ring-2 focus:ring-atp-gold/20 dark:border-neutral-800 dark:bg-transparent dark:text-white dark:placeholder:text-neutral-400"
        />

        <div className="absolute right-0 top-0 flex h-full items-center pr-3">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              className="mr-2 rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}

          <button
            type="submit"
            className="rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && (suggestions.length > 0 || productResults.length > 0 || isLoading) && (
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-lg border bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
          >
            {isLoading && (
              <div className="flex items-center justify-center p-4">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-atp-gold border-t-transparent"></div>
                <span className="ml-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {t("general.loading")}
                </span>
              </div>
            )}

            {/* Product Results with Thumbnails */}
            {!isLoading && productResults.length > 0 && (
              <div className="border-b dark:border-neutral-700">
                <div className="px-4 py-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Products
                </div>
                <div className="grid grid-cols-2 gap-2 p-2">
                  {productResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/${locale}/product/${product.handle}`}
                      onClick={() => {
                        setIsOpen(false);
                        if (onClose) onClose();
                      }}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <div className="relative w-12 h-12 rounded-md overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                        {product.featuredImage?.url ? (
                          <Image
                            src={product.featuredImage.url}
                            alt={product.featuredImage.altText || product.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MagnifyingGlassIcon className="w-4 h-4 text-neutral-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {product.title}
                        </p>
                        <Price
                          amount={product.priceRange.minVariantPrice.amount}
                          currencyCode={product.priceRange.minVariantPrice.currencyCode}
                          className="text-xs text-atp-gold"
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!isLoading && suggestions.length > 0 && (
              <>
                {/* Search History Header */}
                {suggestions.some((s) => s.type === "history") && (
                  <div className="flex items-center justify-between border-b px-4 py-2 dark:border-neutral-700">
                    <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                      <ClockIcon className="mr-2 h-4 w-4" />
                      {safeT("nav.recentSearches", undefined, "Recent searches")}
                    </div>
                    <button
                      onClick={clearHistory}
                      className="text-xs text-atp-gold hover:text-atp-gold/80"
                    >
                      {safeT("nav.clearAll", undefined, "Clear all")}
                    </button>
                  </div>
                )}

                {/* Suggestions List */}
                <div className="py-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex w-full items-center px-4 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                        {suggestion.type === "history" ? (
                          <ClockIcon className="h-4 w-4 text-neutral-500" />
                        ) : (
                          <MagnifyingGlassIcon className="h-4 w-4 text-neutral-500" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">
                          {suggestion.query}
                        </div>
                        {suggestion.category && (
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            {safeT("nav.inCategory", {
                              category: suggestion.category,
                            }, `in ${suggestion.category}`)}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Advanced Search Footer */}
                <div className="border-t px-4 py-2 dark:border-neutral-700">
                  <button
                    onClick={() => router.push("/search")}
                    className="text-sm text-atp-gold hover:text-atp-gold/80"
                  >
                    {safeT("nav.advancedSearch", undefined, "Advanced search")} →
                  </button>
                </div>
              </>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
