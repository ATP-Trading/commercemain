"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import {
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  ChevronDownIcon,
  TagIcon,
  CurrencyDollarIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { DirhamSymbol } from "@/components/icons/dirham-symbol";

interface FilterOption {
  id: string;
  label: string;
  value: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  label: string;
  type: "checkbox" | "radio" | "range" | "select";
  options?: FilterOption[];
  min?: number;
  max?: number;
}

const filterGroups: FilterGroup[] = [
  {
    id: "category",
    label: "Category",
    type: "checkbox",
    options: [
      { id: "skincare", label: "Skincare", value: "skincare", count: 24 },
      {
        id: "supplements",
        label: "Supplements",
        value: "supplements",
        count: 18,
      },
      {
        id: "water-tech",
        label: "Water Technology",
        value: "water-tech",
        count: 8,
      },
      {
        id: "soil-solutions",
        label: "Soil Solutions",
        value: "soil-solutions",
        count: 6,
      },
    ],
  },
  {
    id: "price",
    label: "Price Range (د.إ)",
    type: "range",
    min: 0,
    max: 5000,
  },
  {
    id: "brand",
    label: "Brand",
    type: "checkbox",
    options: [
      { id: "atp", label: "ATP Premium", value: "atp", count: 32 },
      { id: "smone", label: "S'MONE", value: "smone", count: 15 },
      { id: "dna-hya", label: "DNA HYA", value: "dna-hya", count: 12 },
      { id: "aquatech", label: "AquaTech", value: "aquatech", count: 8 },
    ],
  },
  {
    id: "rating",
    label: "Customer Rating",
    type: "radio",
    options: [
      { id: "4-plus", label: "4+ Stars", value: "4+" },
      { id: "3-plus", label: "3+ Stars", value: "3+" },
      { id: "2-plus", label: "2+ Stars", value: "2+" },
      { id: "any", label: "Any Rating", value: "any" },
    ],
  },
  {
    id: "availability",
    label: "Availability",
    type: "checkbox",
    options: [
      { id: "in-stock", label: "In Stock", value: "in-stock", count: 58 },
      { id: "on-sale", label: "On Sale", value: "on-sale", count: 12 },
      {
        id: "new-arrivals",
        label: "New Arrivals",
        value: "new-arrivals",
        count: 8,
      },
      {
        id: "member-exclusive",
        label: "Member Exclusive",
        value: "member-exclusive",
        count: 15,
      },
    ],
  },
];

interface AdvancedFiltersProps {
  className?: string;
}

export default function AdvancedFilters({
  className = "",
}: AdvancedFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {}
  );
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["category"])
  );

  // Initialize filters from URL params
  useEffect(() => {
    const filters: Record<string, string[]> = {};

    filterGroups.forEach((group) => {
      const paramValue = searchParams?.get(group.id);
      if (paramValue) {
        filters[group.id] = paramValue.split(",");
      }
    });

    const minPrice = searchParams?.get("min_price");
    const maxPrice = searchParams?.get("max_price");
    if (minPrice || maxPrice) {
      setPriceRange({
        min: minPrice ? parseInt(minPrice) : 0,
        max: maxPrice ? parseInt(maxPrice) : 5000,
      });
    }

    setActiveFilters(filters);
  }, [searchParams]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const handleFilterChange = (
    groupId: string,
    optionValue: string,
    checked: boolean
  ) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };

      if (!newFilters[groupId]) {
        newFilters[groupId] = [];
      }

      const group = filterGroups.find((g) => g.id === groupId);

      if (group?.type === "radio") {
        newFilters[groupId] = checked ? [optionValue] : [];
      } else {
        if (checked) {
          if (!newFilters[groupId].includes(optionValue)) {
            newFilters[groupId] = [...newFilters[groupId], optionValue];
          }
        } else {
          newFilters[groupId] = newFilters[groupId].filter(
            (v) => v !== optionValue
          );
        }
      }

      return newFilters;
    });
  };

  const handlePriceChange = (min: number, max: number) => {
    setPriceRange({ min, max });
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams?.toString() || "");

    // Clear existing filter params
    filterGroups.forEach((group) => {
      params.delete(group.id);
    });
    params.delete("min_price");
    params.delete("max_price");

    // Add active filters
    Object.entries(activeFilters).forEach(([groupId, values]) => {
      if (values.length > 0) {
        params.set(groupId, values.join(","));
      }
    });

    // Add price range
    if (priceRange.min > 0) {
      params.set("min_price", priceRange.min.toString());
    }
    if (priceRange.max < 5000) {
      params.set("max_price", priceRange.max.toString());
    }

    router.push(`/search?${params.toString()}`);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setPriceRange({ min: 0, max: 5000 });

    const params = new URLSearchParams(searchParams?.toString() || "");
    filterGroups.forEach((group) => {
      params.delete(group.id);
    });
    params.delete("min_price");
    params.delete("max_price");

    router.push(`/search?${params.toString()}`);
  };

  const activeFilterCount =
    Object.values(activeFilters).flat().length +
    (priceRange.min > 0 || priceRange.max < 5000 ? 1 : 0);

  return (
    <div className={`relative ${className}`}>
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-atp-light-gray bg-white px-4 py-2 text-sm font-medium text-atp-black hover:bg-atp-off-white transition-colors dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
      >
        <AdjustmentsHorizontalIcon className="h-4 w-4" />
        Advanced Filters
        {activeFilterCount > 0 && (
          <span className="ml-1 rounded-full bg-atp-gold px-2 py-0.5 text-xs text-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 z-50 mt-2 w-80 rounded-lg border bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3 dark:border-neutral-700">
              <h3 className="font-semibold text-atp-black dark:text-white">
                Advanced Filters
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Filter Groups */}
            <div className="max-h-96 overflow-y-auto p-4 space-y-4">
              {filterGroups.map((group) => (
                <div
                  key={group.id}
                  className="border-b border-neutral-100 pb-4 dark:border-neutral-800"
                >
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <span className="font-medium text-atp-black dark:text-white">
                      {group.label}
                    </span>
                    <ChevronDownIcon
                      className={`h-4 w-4 transition-transform ${expandedGroups.has(group.id) ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  <AnimatePresence>
                    {expandedGroups.has(group.id) && (
                      <m.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-3 space-y-2"
                      >
                        {group.type === "range" ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                placeholder="Min"
                                value={priceRange.min || ""}
                                onChange={(e) =>
                                  handlePriceChange(
                                    parseInt(e.target.value) || 0,
                                    priceRange.max
                                  )
                                }
                                className="w-20 rounded border px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                              />
                              <span>-</span>
                              <input
                                type="number"
                                placeholder="Max"
                                value={priceRange.max || ""}
                                onChange={(e) =>
                                  handlePriceChange(
                                    priceRange.min,
                                    parseInt(e.target.value) || 5000
                                  )
                                }
                                className="w-20 rounded border px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                              />
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                              <DirhamSymbol className="h-3 w-3" />
                              {priceRange.min} - {priceRange.max}
                            </div>
                          </div>
                        ) : (
                          group.options?.map((option) => (
                            <label
                              key={option.id}
                              className="flex items-center gap-2 cursor-pointer hover:bg-neutral-50 rounded p-1 dark:hover:bg-neutral-800"
                            >
                              <input
                                type={
                                  group.type === "radio" ? "radio" : "checkbox"
                                }
                                name={
                                  group.type === "radio" ? group.id : undefined
                                }
                                checked={
                                  activeFilters[group.id]?.includes(
                                    option.value
                                  ) || false
                                }
                                onChange={(e) =>
                                  handleFilterChange(
                                    group.id,
                                    option.value,
                                    e.target.checked
                                  )
                                }
                                className="rounded border-neutral-300 text-atp-gold focus:ring-atp-gold"
                              />
                              <span className="flex-1 text-sm text-neutral-700 dark:text-neutral-300">
                                {option.label}
                              </span>
                              {option.count && (
                                <span className="text-xs text-neutral-500">
                                  ({option.count})
                                </span>
                              )}
                            </label>
                          ))
                        )}
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t px-4 py-3 dark:border-neutral-700">
              <button
                onClick={clearFilters}
                className="text-sm text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                Clear all
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 dark:border-neutral-600 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  onClick={applyFilters}
                  className="rounded-lg bg-atp-gold px-3 py-1.5 text-sm text-white hover:bg-atp-gold/90"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
