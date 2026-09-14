/**
 * Free Delivery Indicator Component
 * 
 * Shows free delivery benefit for ATP members with proper styling, animations, and RTL support.
 * Requirements: 4.5, 5.1, 5.2, 1.1, 1.2, 1.3, 1.4
 */

"use client"

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Truck, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useMembershipDiscount } from "@/hooks/use-storefront-membership-pricing"
import { useMembershipI18n } from '@/lib/utils/membership-i18n';
import { useRTL } from '@/hooks/use-rtl';
import { cn } from '@/lib/utils';

interface FreeDeliveryIndicatorProps {
  className?: string
  variant?: "badge" | "inline" | "card"
  size?: "sm" | "md" | "lg"
}

export function FreeDeliveryIndicator({ 
  className = "", 
  variant = "badge",
  size = "md" 
}: FreeDeliveryIndicatorProps) {
  const t = useTranslations('membership');
  const locale = useLocale() as 'en' | 'ar';
  const { isRTL, direction } = useRTL();
  const { getIconClasses } = useMembershipI18n(locale);
  const { checkFreeDeliveryEligibility, hasActiveMembership } = useMembershipDiscount();

  // Only show if user has active membership and is eligible for free delivery
  if (!hasActiveMembership || !checkFreeDeliveryEligibility()) {
    return null
  }

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5", 
    lg: "text-base px-4 py-2"
  }

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  }

  if (variant === "badge") {
    return (
      <Badge 
        className={cn(
          `bg-green-600 text-white font-semibold membership-badge ${sizeClasses[size]}`,
          isRTL ? 'flex-row-reverse' : 'flex-row',
          className
        )}
        dir={direction}
      >
        <Truck className={cn(iconSizes[size], getIconClasses('start'))} />
        <span>{t('freeDeliveryAllOrders')}</span>
      </Badge>
    )
  }

  if (variant === "inline") {
    return (
      <div 
        className={cn(
          `flex items-center gap-2 text-green-600 font-medium membership-content ${sizeClasses[size]}`,
          isRTL ? 'flex-row-reverse' : 'flex-row',
          className
        )}
        dir={direction}
      >
        <Truck className={iconSizes[size]} />
        <span>{t('freeDeliveryBenefit')}</span>
      </div>
    )
  }

  if (variant === "card") {
    return (
      <div 
        className={cn(
          `bg-green-50 border border-green-200 rounded-lg p-3 membership-content`,
          className
        )}
        dir={direction}
      >
        <div className={cn(
          "flex items-center gap-2 text-green-700",
          isRTL ? 'flex-row-reverse' : 'flex-row'
        )}>
          <div className="flex-shrink-0">
            <Check className="w-5 h-5 bg-green-600 text-white rounded-full p-1" />
          </div>
          <div className={cn(isRTL ? 'text-right' : 'text-left')}>
            <p className="font-semibold text-sm">
              {t('freeDeliveryIncluded')}
            </p>
            <p className="text-xs text-green-600">
              {t('freeDeliveryBenefit')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}