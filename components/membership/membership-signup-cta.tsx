/**
 * Membership Signup CTA Component
 *
 * Compact call-to-action component for membership signup that can be used
 * throughout the application (homepage, account pages, etc.).
 */

"use client";

import React from "react";
import { useTranslations } from 'next-intl';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Truck, ArrowRight } from "lucide-react";
import { useAtpMembership } from "../../hooks/use-atp-membership";
import { useCustomer } from "../../hooks/use-customer";
import { DirhamSymbol } from "@/components/icons/dirham-symbol";
import { Link } from "@/src/i18n/navigation";

interface MembershipSignupCtaProps {
  className?: string;
  variant?: "compact" | "expanded";
  showBenefits?: boolean;
}

export function MembershipSignupCta({
  className,
  variant = "compact",
  showBenefits = true,
}: MembershipSignupCtaProps) {
  const t = useTranslations('membership');
  const { membership, isLoading } = useAtpMembership();
  const { customer } = useCustomer();

  // Don't show if user already has membership
  if (membership && !isLoading) {
    return null;
  }

  if (variant === "compact") {
    return (
      <Card
        className={`bg-gradient-to-r from-atp-gold/10 to-atp-gold/5 border-atp-gold/20 ${className}`}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-atp-gold/20 rounded-full">
                <Crown className="h-5 w-5 text-atp-gold" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('title')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('compactBenefits')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-lg font-bold text-atp-gold">
                <DirhamSymbol size={18} />
                <span>99</span>
                <span className="text-sm">
                  {t('perYear')}
                </span>
              </div>
              <Button size="sm" className="atp-button-gold mt-2" asChild>
                <Link href="/atp-membership">
                  {t('joinNow')}
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`bg-gradient-to-br from-atp-gold/10 via-white to-atp-gold/5 border-atp-gold/20 ${className}`}
    >
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <div className="p-3 bg-atp-gold/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Crown className="h-8 w-8 text-atp-gold" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {t('signupTitle')}
          </h3>
          <p className="text-gray-600">
            {t('unlockBenefits')}
          </p>
        </div>

        {/* Pricing */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <DirhamSymbol size={32} className="text-atp-gold" />
            <span className="text-4xl font-bold text-atp-gold">99</span>
            <div className="text-left">
              <div className="text-xs text-gray-500">
                {t('perYear')}
              </div>
            </div>
          </div>
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <span className="flex items-center gap-1">
              {t('savingsMessage')}
            </span>
          </Badge>
        </div>

        {/* Benefits */}
        {showBenefits && (
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Star className="h-3 w-3 text-green-600" />
              </div>
              <span>{t('serviceDiscount')}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <Truck className="h-3 w-3 text-blue-600" />
              </div>
              <span>{t('freeDeliveryAllOrders')}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                <Crown className="h-3 w-3 text-purple-600" />
              </div>
              <span>{t('prioritySupport')}</span>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <div className="space-y-3">
          <Button className="w-full atp-button-gold" size="lg" asChild>
            <Link
              href="/atp-membership"
              className="flex items-center justify-center gap-2"
            >
              <Crown className="h-5 w-5" />
              {t('signupTitle')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          {!customer && (
            <p className="text-xs text-center text-gray-500">
              <Link
                href="/login"
                className="text-atp-gold hover:underline"
              >
                {t('logIn')}
              </Link>{" "}
              {t('toPurchaseMembership')}
            </p>
          )}
        </div>

        <p className="text-xs text-center text-gray-500 mt-4">
          {t('roiMessage')}
        </p>
      </CardContent>
    </Card>
  );
}
