"use client"

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { MembershipBadge } from "@/components/membership/membership-badge"
import { UAE_DIRHAM_CODE } from "@/lib/constants"
import { DirhamSymbol } from "@/components/icons/dirham-symbol"
import { useMembershipDiscount } from "@/hooks/use-storefront-membership-pricing"
import { MEMBERSHIP_CONFIG } from "@/lib/constants/membership"
import { useMembershipI18n } from "@/lib/utils/membership-i18n"
import { useRTL } from "@/hooks/use-rtl"
import { Truck } from "lucide-react"
import { cn } from "@/lib/utils"

interface MemberPricingProps {
  originalPrice: string
  serviceId?: string
  currencyCode?: string
  className?: string
  showFreeDelivery?: boolean
}

export function MemberPricing({ 
  originalPrice, 
  serviceId, 
  currencyCode = UAE_DIRHAM_CODE, 
  className,
  showFreeDelivery = false
}: MemberPricingProps) {
  const t = useTranslations('membership');
  const locale = useLocale() as 'en' | 'ar';
  const { isRTL, direction } = useRTL();
  const { 
    formatPrice, 
    getRTLClasses, 
    getIconClasses,
    formatPercentage 
  } = useMembershipI18n(locale);
  
  const { 
    membership, 
    calculateServiceDiscount, 
    checkFreeDeliveryEligibility, 
    hasActiveMembership 
  } = useMembershipDiscount()

  const price = Number.parseFloat(originalPrice)
  const rtlClasses = getRTLClasses();

  // If no active membership, show regular price
  if (!hasActiveMembership) {
    const regularPrice = formatPrice(price);
    
    return (
      <div className={cn(
        "membership-pricing membership-content",
        rtlClasses.flexDirection,
        className
      )} dir={direction}>
        <span className={cn(
          "text-2xl font-bold currency-display",
          isRTL ? "flex-row-reverse" : "flex-row"
        )}>
          {isRTL ? (
            <>
              <span>{regularPrice.formatted}</span>
              <DirhamSymbol size={20} />
            </>
          ) : (
            <>
              <DirhamSymbol size={20} />
              <span>{regularPrice.formatted}</span>
            </>
          )}
        </span>
      </div>
    )
  }

  // Calculate ATP membership discount
  const discountCalculation = calculateServiceDiscount(price, serviceId)
  const isEligibleForFreeDelivery = checkFreeDeliveryEligibility()
  
  const originalPriceFormatted = formatPrice(price);
  const finalPriceFormatted = formatPrice(discountCalculation.finalPrice);
  const savingsFormatted = formatPrice(discountCalculation.savings);
  const discountPercentage = Math.round(MEMBERSHIP_CONFIG.SERVICE_DISCOUNT_PERCENTAGE * 100);

  return (
    <div className={cn(
      "space-y-2 membership-content",
      className
    )} dir={direction}>
      {/* Price Display */}
      <div className={cn(
        "flex items-center gap-3",
        isRTL ? "flex-row-reverse" : "flex-row"
      )}>
        {/* Original Price (Crossed Out) */}
        <span className={cn(
          "text-lg text-muted-foreground line-through currency-display",
          isRTL ? "flex-row-reverse" : "flex-row"
        )}>
          {isRTL ? (
            <>
              <span>{originalPriceFormatted.formatted}</span>
              <DirhamSymbol size={16} />
            </>
          ) : (
            <>
              <DirhamSymbol size={16} />
              <span>{originalPriceFormatted.formatted}</span>
            </>
          )}
        </span>
        
        {/* Member Price */}
        <span className={cn(
          "text-2xl font-bold text-atp-gold currency-display",
          isRTL ? "flex-row-reverse" : "flex-row"
        )}>
          {isRTL ? (
            <>
              <span>{finalPriceFormatted.formatted}</span>
              <DirhamSymbol size={20} />
            </>
          ) : (
            <>
              <DirhamSymbol size={20} />
              <span>{finalPriceFormatted.formatted}</span>
            </>
          )}
        </span>
      </div>
      
      {/* Membership Badge and Savings */}
      <div className={cn(
        "flex items-center gap-2 flex-wrap",
        isRTL ? "flex-row-reverse" : "flex-row"
      )}>
        <MembershipBadge 
          tier="atp" 
          discount={discountPercentage}
          className="membership-badge"
        />
        <span className={cn(
          "text-sm text-atp-gold font-medium currency-display",
          isRTL ? "flex-row-reverse" : "flex-row"
        )}>
          <span>{t('youSave')}</span>
          {isRTL ? (
            <>
              <span>{savingsFormatted.formatted}</span>
              <DirhamSymbol size={12} />
            </>
          ) : (
            <>
              <DirhamSymbol size={12} />
              <span>{savingsFormatted.formatted}</span>
            </>
          )}
        </span>
      </div>

      {/* Free delivery indicator */}
      {showFreeDelivery && isEligibleForFreeDelivery && (
        <div className={cn(
          "flex items-center gap-2 text-sm text-green-600 font-medium",
          isRTL ? "flex-row-reverse" : "flex-row"
        )}>
          <Truck className={cn("w-4 h-4", getIconClasses('start'))} />
          <span>{t('freeDeliveryBenefit')}</span>
        </div>
      )}
    </div>
  )
}
