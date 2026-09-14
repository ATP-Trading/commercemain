/**
 * ATP Membership Widget
 *
 * Compact membership status widget for account overview.
 */

"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Calendar, TrendingUp, ArrowRight } from "lucide-react";
import { useAtpMembership } from "../../hooks/use-atp-membership";
import { useBenefitSummary } from "../../hooks/use-membership-benefits";
import { DirhamSymbol } from "@/components/icons/dirham-symbol";
import { Link } from "@/src/i18n/navigation";

interface AtpMembershipWidgetProps {
  customerId?: string;
  className?: string;
}

export function AtpMembershipWidget({
  customerId,
  className,
}: AtpMembershipWidgetProps) {
  const {
    membership,
    stats,
    isLoading,
    isActive,
    isExpired,
    daysUntilExpiration,
  } = useAtpMembership();

  const { hasActiveBenefits } = useBenefitSummary();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="w-32 h-5 bg-gray-200 rounded animate-pulse" />
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!membership) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <Crown className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <CardTitle className="text-lg">ATP Membership</CardTitle>
                <CardDescription>Not a member yet</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Join ATP Membership for 15% off eligible supplements and skincare, 10% off water and soil products, and free UAE delivery.
          </p>
          <div className="flex items-center justify-between">
            <div className="text-sm flex items-center gap-2">
              <span className="text-atp-gold font-semibold flex items-center gap-1">
                <span>99</span>
                <DirhamSymbol size={14} />
                <span>/year</span>
              </span>

            </div>
            <Button size="sm" className="atp-button-gold" asChild>
              <Link href="/atp-membership">Join Now</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-atp-gold/10 rounded-full">
              <Crown className="h-6 w-6 text-atp-gold" />
            </div>
            <div>
              <CardTitle className="text-lg">ATP Membership</CardTitle>
              <CardDescription>Annual Premium Membership</CardDescription>
            </div>
          </div>
          <Badge
            variant={isActive ? "default" : "secondary"}
            className={isActive ? "bg-green-500 hover:bg-green-600" : ""}
          >
            {isActive ? "ACTIVE" : isExpired ? "EXPIRED" : "INACTIVE"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-lg font-bold text-green-500">
              <DirhamSymbol size={16} />
              {stats?.totalSavings?.toFixed(0) || "0"}
            </div>
            <p className="text-xs text-muted-foreground">Total Savings</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">
              {isActive ? `${daysUntilExpiration}` : "0"}
            </div>
            <p className="text-xs text-muted-foreground">Days Left</p>
          </div>
        </div>

        {/* Expiration Info */}
        {isActive && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Expires {new Date(membership.expirationDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Benefits Preview */}
        {hasActiveBenefits && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>10–15% Category Discounts</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Free Delivery</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button variant="outline" className="w-full" asChild>
          <Link
            href="/account/membership"
            className="flex items-center justify-center gap-2"
          >
            Manage Membership
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
