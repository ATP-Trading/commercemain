"use client";

import React from "react";
import { FilterList } from "@/components/layout/search/filter/index";
import AdvancedFilters from "@/components/search/advanced-filters";
import { Suspense } from "react";
import { m } from "framer-motion";
import { Filter, X } from "lucide-react";
import { useState } from "react";

interface SearchLayoutClientProps {
  sorting: any[];
  children: React.ReactNode;
}

export default function SearchLayoutClient({
  sorting,
  children,
}: SearchLayoutClientProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Extract the Collections, ChildrenWrapper, and Footer from children
  const childrenArray = React.Children.toArray(children);
  const collections = childrenArray[0];
  const mainContent = childrenArray[1];
  const footer = childrenArray[2];

  return (
    <>
      <div className="bg-atp-black text-atp-white py-8">
        <div className="container-premium">
          <m.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Discover Products
            </h1>
            <div className="w-24 h-1 bg-atp-gold mx-auto mb-6"></div>
            <p className="text-xl text-atp-white/90 max-w-2xl mx-auto">
              Find the perfect products from our premium collections
            </p>
          </m.div>
        </div>
      </div>

      <div className="bg-atp-off-white min-h-screen">
        <div className="container-premium py-8">
          <div className="md:hidden mb-6">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 bg-atp-white border border-atp-light-gray px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filters & Collections</span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <m.div
              className={`
                w-full md:w-80 flex-none space-y-6
                ${isFilterOpen ? "block" : "hidden md:block"}
              `}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Collections Filter */}
              <div className="bg-atp-white rounded-lg shadow-sm border border-atp-light-gray p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-atp-black">
                    Collections
                  </h3>
                  {isFilterOpen && (
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="md:hidden p-1 hover:bg-atp-light-gray rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {collections}
              </div>

              {/* Advanced Filters */}
              <div className="bg-atp-white rounded-lg shadow-sm border border-atp-light-gray p-6">
                <h3 className="text-lg font-semibold text-atp-black mb-4">
                  Filters
                </h3>
                <AdvancedFilters />
              </div>

              {/* Sort Filter */}
              <div className="bg-atp-white rounded-lg shadow-sm border border-atp-light-gray p-6">
                <h3 className="text-lg font-semibold text-atp-black mb-4">
                  Sort By
                </h3>
                <FilterList list={sorting} />
              </div>

              <div className="bg-atp-white rounded-lg shadow-sm border border-atp-light-gray p-6">
                <h3 className="text-lg font-semibold text-atp-black mb-4">
                  Price Range
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="flex-1 px-3 py-2 border border-atp-light-gray rounded-md focus:outline-none focus:ring-2 focus:ring-atp-gold focus:border-transparent"
                    />
                    <span className="flex items-center text-atp-charcoal">
                      -
                    </span>
                    <input
                      type="number"
                      placeholder="Max"
                      className="flex-1 px-3 py-2 border border-atp-light-gray rounded-md focus:outline-none focus:ring-2 focus:ring-atp-gold focus:border-transparent"
                    />
                  </div>
                  <button className="w-full bg-atp-black text-atp-white py-2 rounded-md hover:bg-atp-charcoal transition-colors duration-200">
                    Apply
                  </button>
                </div>
              </div>

              <div className="bg-atp-white rounded-lg shadow-sm border border-atp-light-gray p-6">
                <h3 className="text-lg font-semibold text-atp-black mb-4">
                  Product Type
                </h3>
                <div className="space-y-2">
                  {[
                    "Skincare",
                    "Supplements",
                    "Water Technology",
                    "Soil Solutions",
                  ].map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 cursor-pointer hover:bg-atp-off-white p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-atp-gold border-atp-light-gray rounded focus:ring-atp-gold"
                      />
                      <span className="text-atp-charcoal">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-atp-gold/10 to-atp-gold/5 rounded-lg border border-atp-gold/20 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-atp-gold rounded-full"></div>
                  <h3 className="text-lg font-semibold text-atp-black">
                    ATP Membership
                  </h3>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-atp-gold/10 p-2 rounded">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-atp-gold border-atp-gold rounded focus:ring-atp-gold"
                    />
                    <span className="text-atp-charcoal">Member Exclusive</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-atp-gold/10 p-2 rounded">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-atp-gold border-atp-gold rounded focus:ring-atp-gold"
                    />
                    <span className="text-atp-charcoal">Member Discounts</span>
                  </label>
                </div>
              </div>
            </m.div>

            <m.div
              className="flex-1 min-h-screen"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Suspense
                fallback={
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-atp-white rounded-lg shadow-sm border border-atp-light-gray p-4 animate-pulse"
                      >
                        <div className="aspect-square bg-atp-light-gray rounded-md mb-4"></div>
                        <div className="h-4 bg-atp-light-gray rounded mb-2"></div>
                        <div className="h-4 bg-atp-light-gray rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                }
              >
                {mainContent}
              </Suspense>
            </m.div>
          </div>
        </div>
      </div>
      {footer}
    </>
  );
}
