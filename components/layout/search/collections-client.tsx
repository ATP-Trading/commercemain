"use client"

import { Suspense } from "react"
import { m } from "framer-motion"
import { FilterList, type PathFilterItem } from "./filter/index"

interface CollectionsClientProps {
  collections: PathFilterItem[]
}

export default function CollectionsClient({ collections }: CollectionsClientProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <m.div
              key={i}
              className="h-10 bg-atp-light-gray rounded-md animate-pulse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            />
          ))}
        </div>
      }
    >
      <FilterList list={collections} />
    </Suspense>
  )
}
