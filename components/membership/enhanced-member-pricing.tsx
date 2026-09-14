"use client";

import { MemberPricing } from "./member-pricing";
import { FreeDeliveryIndicator } from "./free-delivery-indicator";
import { MembershipBadge } from "./membership-badge";
import { useMembershipDiscount } from "@/hooks/use-storefront-membership-pricing";
import { UAE_DIRHAM_CODE } from "@/lib/constants";
import { DirhamSymbol } from "@/components/icons/dirham-symbol";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/src/i18n/navigation";
import { useTranslations } from 'next-intl';

interface EnhancedMemberPricingProps {
  originalPrice: string;
  discountRate?: number;
  serviceId?: string;
  currencyCode?: string;
  className?: string;
  showFreeDelivery?: boolean;
  showMembershipCTA?: boolean;
  productType?: "service" | "product";
}

export function EnhancedMemberPricing({
  originalPrice,
  discountRate = 0.15,
  serviceId,
  currencyCode = UAE_DIRHAM_CODE,
  className = "",
  showFreeDelivery = true,
  showMembershipCTA = true,
  productType = "service",
}: EnhancedMemberPricingProps) {
  const t = useTranslations('membership');
  const { hasActiveMembership, isLoading } =
    useMembershipDiscount();
  const price = Number.parseFloat(originalPrice);

  // If user has active membership, show member pricing
  if (hasActiveMembership) {
    return (
      <div className={`space-y-3 ${className}`}>
        <MemberPricing
          originalPrice={originalPrice}
          discountRate={discountRate}
          serviceId={serviceId}
          currencyCode={currencyCode}
          showFreeDelivery={showFreeDelivery && productType === "product"}
        />


      </div>
    );
  }

  // If user doesn't have membership, show regular price with CTA
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Regular pricing */}
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold flex items-center gap-1">
          <DirhamSymbol size={20} />
          {price.toFixed(2)}
        </span>
      </div>

      {/* Membership CTA */}
      {showMembershipCTA && !isLoading && (
        <Card className="bg-atp-gold/5 border-atp-gold/20">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MembershipBadge tier="atp" discount={Math.round(discountRate * 100)} className="text-xs" />
                </div>
                <p className="text-sm font-medium text-atp-black mb-1">
                  {t('savePercent', { percent: Math.round(discountRate * 100) })}
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  {t('memberPriceLabel')}{" "}
                  <span className="font-semibold text-atp-gold">
                    <DirhamSymbol className="inline w-3 h-3" />
                    {(price * (1 - discountRate)).toFixed(2)}
                  </span>
                  {productType === "product" && t('plusFreeDelivery')}
                </p>
                <Link href="/atp-membership">
                  <Button
                    size="sm"
                    className="bg-atp-gold hover:bg-atp-gold/90 text-atp-black font-semibold"
                  >
                    {t('joinMembership')}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
