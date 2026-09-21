"use client"

import Grid from "@/components/grid"
import { GridTileImage } from "@/components/grid/tile"
import { MembershipBadge } from "@/components/membership/membership-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProductQuickView } from "@/components/product/product-quick-view"
import { useMembership } from "@/hooks/use-membership"
import { useMembershipDiscount } from "@/hooks/use-storefront-membership-pricing"
import type { Product } from "@/lib/shopify/types"
import { getLocalizedProductTitle, getLocalizedProductHandle } from "@/lib/shopify/i18n-queries"
import { Award, Eye, Leaf, Star } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

export default function ATPProductGridItems({
  products,
  locale = 'en'
}: {
  products: Product[]
  locale?: 'en' | 'ar'
}) {
  const { isMember } = useMembership()
  const { calculateServiceDiscount } = useMembershipDiscount()
  const t = useTranslations("quickView")

  return (
    <>
      {products.map((product) => {
        // Get localized title and handle
        const localizedTitle = getLocalizedProductTitle(product, locale)
        const localizedHandle = getLocalizedProductHandle(product, locale)

        const isWellnessProduct = product.tags.some((tag) =>
          ["skincare", "supplements", "wellness", "natural"].includes(tag.toLowerCase()),
        )
        const isTechProduct = product.tags.some((tag) =>
          ["water-technology", "soil-technology", "tech", "professional"].includes(tag.toLowerCase()),
        )
        const isPremium = product.tags.includes("premium")

        const originalPrice = Number.parseFloat(product.priceRange.maxVariantPrice.amount)
        const discountCalculation = isMember
          ? calculateServiceDiscount(originalPrice, 'cosmetics-supplements')
          : null

        const pricing = {
          originalPrice,
          memberPrice: discountCalculation?.finalPrice || originalPrice,
          savings: discountCalculation?.savings || 0,
        }

        // Check if this is the EMS PRO ONE SUIT product that should redirect externally
        const isEMSProOneSuit = product.handle === "ems-pro-one-suit";

        return (
          <Grid.Item key={product.handle} className="animate-fadeIn group">
            <div className="relative inline-block h-full w-full">
              {isEMSProOneSuit ? (
                <a
                  className="block h-full w-full"
                  href="https://emsproone.com/?ref=ATPTRADING"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="relative">
                    {/* Product Badges */}
                    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                      {isPremium && (
                        <Badge className="bg-atp-gold text-atp-black text-xs">
                          <Star className="w-2 h-2 mr-1" />
                          {locale === 'ar' ? 'متميز' : 'Premium'}
                        </Badge>
                      )}
                      {isWellnessProduct && (
                        <Badge variant="secondary" className="bg-atp-wellness-green/90 text-white text-xs">
                          <Leaf className="w-2 h-2 mr-1" />
                          {locale === 'ar' ? 'العافية' : 'Wellness'}
                        </Badge>
                      )}
                      {isTechProduct && (
                        <Badge variant="secondary" className="bg-blue-500/90 text-white text-xs">
                          <Award className="w-2 h-2 mr-1" />
                          {locale === 'ar' ? 'تقني' : 'Tech'}
                        </Badge>
                      )}
                    </div>

                    {/* ATP Member Savings Badge */}
                    {isMember && pricing.savings > 0 && (
                      <div className="absolute top-2 right-2 z-10">
                        <MembershipBadge tier="atp" className="text-xs" />
                      </div>
                    )}

                    <GridTileImage
                      alt={localizedTitle}
                      label={{
                        title: localizedTitle,
                        amount: isMember ? pricing.memberPrice.toFixed(2) : pricing.originalPrice.toFixed(2),
                        currencyCode: product.priceRange.maxVariantPrice.currencyCode,
                      }}
                      src={product.featuredImage?.url}
                      fill
                      sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 50vw"
                    />
                  </div>
                </a>
              ) : (
                <Link className="block h-full w-full" href={`/${locale}/product/${localizedHandle}`} prefetch={true}>
                  <div className="relative">
                    {/* Product Badges */}
                    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                      {isPremium && (
                        <Badge className="bg-atp-gold text-atp-black text-xs">
                          <Star className="w-2 h-2 mr-1" />
                          {locale === 'ar' ? 'متميز' : 'Premium'}
                        </Badge>
                      )}
                      {isWellnessProduct && (
                        <Badge variant="secondary" className="bg-atp-wellness-green/90 text-white text-xs">
                          <Leaf className="w-2 h-2 mr-1" />
                          {locale === 'ar' ? 'العافية' : 'Wellness'}
                        </Badge>
                      )}
                      {isTechProduct && (
                        <Badge variant="secondary" className="bg-blue-500/90 text-white text-xs">
                          <Award className="w-2 h-2 mr-1" />
                          {locale === 'ar' ? 'تقني' : 'Tech'}
                        </Badge>
                      )}
                    </div>

                    {/* ATP Member Savings Badge */}
                    {isMember && pricing.savings > 0 && (
                      <div className="absolute top-2 right-2 z-10">
                        <MembershipBadge tier="atp" className="text-xs" />
                      </div>
                    )}

                    <GridTileImage
                      alt={localizedTitle}
                      label={{
                        title: localizedTitle,
                        amount: isMember ? pricing.memberPrice.toFixed(2) : pricing.originalPrice.toFixed(2),
                        currencyCode: product.priceRange.maxVariantPrice.currencyCode,
                      }}
                      src={product.featuredImage?.url}
                      fill
                      sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 50vw"
                    />
                  </div>
                </Link>
              )}

              {/* Quick View Button - appears on hover */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ProductQuickView product={product}>
                  <Button
                    size="sm"
                    className="bg-white/90 hover:bg-white text-atp-black shadow-lg backdrop-blur-sm"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {t("viewDetails")}
                  </Button>
                </ProductQuickView>
              </div>
            </div>
          </Grid.Item>
        )
      })}
    </>
  )
}
