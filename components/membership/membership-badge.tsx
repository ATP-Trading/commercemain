"use client"

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Badge } from "@/components/ui/badge"
import { Crown, Star, Zap, Shield } from "lucide-react"
import { MEMBERSHIP_CONFIG } from "@/lib/constants/membership"
import { useMembershipI18n } from "@/lib/utils/membership-i18n"
import { useRTL } from "@/hooks/use-rtl"
import { cn } from "@/lib/utils"

interface MembershipBadgeProps {
  tier?: "basic" | "essential" | "premium" | "elite" | "atp" | null
  discount?: number
  className?: string
  showStatus?: boolean
  showDiscount?: boolean
}

export function MembershipBadge({ 
  tier, 
  discount, 
  className, 
  showStatus = false,
  showDiscount = discount !== undefined
}: MembershipBadgeProps) {
  const t = useTranslations('membership');
  const locale = useLocale() as 'en' | 'ar';
  const { isRTL, direction } = useRTL();
  const { getMembershipTierName, getIconClasses, formatPercentage } = useMembershipI18n(locale);
  const statusInfo = { status: "none" as const };
  const isExpiringSoon = false;

  const tierConfig = {
    essential: {
      name: getMembershipTierName("basic"),
      icon: Star,
      color: "bg-blue-500",
      discount: 10,
    },
    premium: {
      name: getMembershipTierName("premium"),
      icon: Crown,
      color: "bg-atp-gold",
      discount: 15,
    },
    elite: {
      name: getMembershipTierName("elite"),
      icon: Zap,
      color: "bg-purple-600",
      discount: 20,
    },
    atp: {
      name: getMembershipTierName("atp"),
      icon: Shield,
      color: "bg-atp-gold",
      discount: Math.round(MEMBERSHIP_CONFIG.SERVICE_DISCOUNT_PERCENTAGE * 100),
    },
  } as const;

  // Status-based translations
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return t('statusActive');
      case 'expiring':
        return t('statusExpiring');
      case 'expired':
        return t('statusExpired');
      case 'inactive':
        return t('statusInactive');
      default:
        return status;
    }
  };

  // If showStatus is true and we have membership data, show status-based badge
  if (showStatus && statusInfo.status !== 'none') {
    const statusColors = {
      active: "bg-green-600",
      expiring: "bg-yellow-600", 
      expired: "bg-red-600",
      inactive: "bg-gray-600"
    };

    const statusColor = statusColors[statusInfo.status as keyof typeof statusColors] || "bg-gray-600";
    const statusText = getStatusText(statusInfo.status);

    return (
      <Badge 
        className={cn(
          `${statusColor} text-white font-semibold px-3 py-1 membership-badge`,
          isRTL ? "flex-row-reverse" : "flex-row",
          className
        )}
        dir={direction}
      >
        <Shield className={cn("w-3 h-3", getIconClasses('start'))} />
        <span>
          {t('atpMembership')} - {statusText}
        </span>
      </Badge>
    );
  }

  // Default tier-based badge
  if (!tier) return null;

  const normalizedTier = tier === 'basic' ? 'essential' : tier;
  const config = tierConfig[normalizedTier];
  if (!config) return null;

  const IconComponent = config.icon;
  const memberDiscount = discount ?? config.discount;

  // For ATP tier, show additional styling if expiring soon
  const badgeColor = normalizedTier === 'atp' && isExpiringSoon 
    ? "bg-yellow-600" 
    : config.color;

  // Format discount percentage
  const discountText = t('discountOff', { discount: memberDiscount });

  return (
    <Badge 
      className={cn(
        `${badgeColor} text-white font-semibold px-3 py-1 membership-badge`,
        isRTL ? "flex-row-reverse" : "flex-row",
        className
      )}
      dir={direction}
    >
      <IconComponent className={cn("w-3 h-3", getIconClasses('start'))} />
      <span>
        {config.name}{showDiscount && <> - {discountText}</>}
      </span>
    </Badge>
  );
}
