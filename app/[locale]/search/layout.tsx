import type React from "react"

import Collections from "@/components/layout/search/collections"
import { sorting } from "@/lib/constants"
import ChildrenWrapper from "./children-wrapper"
import { Suspense } from "react"
import SearchLayoutClient from "./search-layout-client"

export default async function SearchLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {

  const { locale } = await params;
  return (
    <SearchLayoutClient sorting={sorting}>
      <Collections locale={locale} />
      <ChildrenWrapper>{children}</ChildrenWrapper>
    </SearchLayoutClient>
  )
}
