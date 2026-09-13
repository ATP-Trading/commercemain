/**
 * ATP Membership Signup Component
 * 
 * Displays membership benefits, pricing, and handles the signup flow with Shopify checkout integration.
 * Enhanced with RTL support and full internationalization.
 * Requirements: 1.2, 1.3, 1.4, 2.1, 2.2, 1.1
 */

'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Crown,
  Check,
  Truck,
  Star,
  Gift,
  ArrowRight,
  Shield,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useAtpMembership } from '../../hooks/use-atp-membership';
import { useCustomer } from '../../hooks/use-customer';
import { useMembershipFormErrorHandling } from '../../hooks/use-membership-error-handling';
import { MembershipFormErrorBoundary } from './membership-error-boundary';
import { MembershipErrorDisplay, NetworkStatusDisplay } from './membership-error-display';
import { MembershipError, MembershipErrorCode } from '@/lib/errors/membership-errors';
import { DirhamSymbol } from '@/components/icons/dirham-symbol';
import { useMembershipI18n } from '@/lib/utils/membership-i18n';
import { useRTL } from '@/hooks/use-rtl';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface AtpMembershipSignupProps {
  className?: string;
  onSignupSuccess?: () => void;
  onSignupError?: (error: Error) => void;
}

export function AtpMembershipSignup({ 
  className,
  onSignupSuccess,
  onSignupError
}: AtpMembershipSignupProps) {
  const t = useTranslations('membership');
  const locale = useLocale() as 'en' | 'ar';
  const { isRTL, direction } = useRTL();
  const { formatPrice, getIconClasses, getRTLClasses } = useMembershipI18n(locale);
  const [isProcessing, setIsProcessing] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const { membership, isLoading, purchaseMembership } = useAtpMembership();
  const errorHandling = useMembershipFormErrorHandling();
  const { customer } = useCustomer();
  const rtlClasses = getRTLClasses();

  // Handle membership signup
  const handleSignup = async () => {
    if (!customer?.id) {
      const errorMessage = t('pleaseLogInToPurchase');
      
      errorHandling.addError(new MembershipError(
        errorMessage,
        MembershipErrorCode.INVALID_CUSTOMER
      ));
      return;
    }

    setIsProcessing(true);
    errorHandling.clearErrors();

    const result = await errorHandling.handleAsyncError(async () => {
      try {
        return await purchaseMembership(customer.id);
      } catch (error) {
        onSignupError?.(error instanceof Error ? error : new Error('Signup failed'));
        throw error;
      }
    });

    if (result) {
      // Track successful signup
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'membership_signup_success', {
          event_category: 'membership',
          event_label: 'atp_membership',
          value: 99
        });
      }
      
      // Redirect to Shopify checkout
      window.location.href = result;
    } else {
      const error = errorHandling.errors[0] || new Error('Signup failed');
      
      // Track signup errors
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'membership_signup_error', {
          event_category: 'membership',
          event_label: 'atp_membership',
          error_message: error.message
        });
      }
    }

    setIsProcessing(false);
  };

  // If user already has membership, show different content
  if (membership && !isLoading) {
    return (
      <Card className={cn("membership-content", className)} dir={direction}>
        <CardContent className={cn("p-8 text-center", isRTL ? 'text-right' : 'text-left')}>
          <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {t('alreadyMember')}
          </h3>
          <p className="text-muted-foreground mb-6">
            {t('alreadyMemberDescription')}
          </p>
          <Button className="atp-button-gold" asChild>
            <Link href="/account/membership">
              {t('viewDashboard')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-8 membership-content", className)} dir={direction}>
      {/* Success Message */}
      {signupSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {t('signupSuccess')}{" "}
            {t('confirmationEmail')}
          </AlertDescription>
        </Alert>
      )}

      {/* Network Status */}
      <NetworkStatusDisplay 
        isOffline={errorHandling.isOffline} 
        onRetry={errorHandling.retry}
      />

      {/* Error Messages */}
      {errorHandling.hasError && (
        <div className="space-y-2">
          {errorHandling.errors.map((error, index) => (
            <MembershipErrorDisplay
              key={index}
              error={error}
              onRetry={errorHandling.retry}
              onDismiss={() => errorHandling.clearError(index)}
              dismissLabel={t('dismissError')}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pricing Card */}
        <Card className="relative overflow-hidden membership-card">
          <div className={cn(
            "absolute top-0 bg-atp-gold text-white px-4 py-1 text-sm font-medium",
            isRTL ? "left-0" : "right-0"
          )}>
            {t('premium')}
          </div>
          <CardHeader className={cn("pb-2", isRTL ? "text-right" : "text-center")}>
            <div className="p-3 bg-atp-gold/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Crown className="h-8 w-8 text-atp-gold" />
            </div>
            <CardTitle className="text-2xl">
              {t('signupTitle')}
            </CardTitle>
            <CardDescription className="text-base">
              {t('subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className={cn("space-y-6", isRTL ? "text-right" : "text-center")}>
            {/* Pricing */}
            <div className="space-y-2">
              <div className={cn(
                "text-4xl font-bold flex items-center justify-center gap-2 currency-display",
                isRTL ? "flex-row-reverse" : "flex-row"
              )}>
                {isRTL ? (
                  <>
                    <div className="text-lg text-muted-foreground">
                      <div className="text-sm">
                        {t('perYear')}
                      </div>
                    </div>
                    <span className="text-2xl">99</span>
                    <DirhamSymbol size={32} className="text-atp-gold" />
                  </>
                ) : (
                  <>
                    <DirhamSymbol size={32} className="text-atp-gold" />
                    <span className="text-2xl">99</span>
                    <div className="text-lg text-muted-foreground">
                      <div className="text-sm">
                        {t('perYear')}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {t('annualFee')}
              </p>
            </div>

            {/* Value Proposition */}
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800 font-medium text-sm flex items-center gap-1">
                {t('savingsMessage')}
              </p>
              <p className="text-green-600 text-xs mt-1">
                {t('roiMessage')}
              </p>
            </div>

            {/* Signup Button */}
            <div className="space-y-3">
              <Button
                className="w-full atp-button-gold text-lg py-6"
                onClick={handleSignup}
                disabled={isProcessing || isLoading || !customer}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    {t('processingPayment')}
                  </>
                ) : (
                  <>
                    <Crown className="h-5 w-5 mr-2" />
                    <span className="flex items-center gap-2">
                      {t('signupTitle')} - 
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        99 <DirhamSymbol size={16} />
                      </span>
                    </span>
                  </>
                )}
              </Button>

              {!customer && (
                <p className="text-sm text-muted-foreground">
                  {t('pleaseLogIn')}{" "}
                  <Link href="/account/login" className="text-atp-gold hover:underline">
                    {t('logIn')}
                  </Link>{" "}
                  {t('toPurchaseMembership')}
                </p>
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>{t('securePayment')}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {t('termsAcceptance')}
            </p>
          </CardContent>
        </Card>

        {/* Benefits Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-atp-gold" />
              {t('benefitsTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Benefits List */}
            <div className="space-y-4">
              <BenefitItem
                icon={<Star className="h-5 w-5 text-atp-gold" />}
                title={t('benefit15Service')}
                description={t('benefit15ServiceDesc')}
                badge={t('badge15OFF')}
              />
              <BenefitItem
                icon={<Truck className="h-5 w-5 text-blue-600" />}
                title={t('benefitFreeDelivery')}
                description={t('benefitFreeDeliveryDesc')}
                badge={t('badgeFree')}
              />
              <BenefitItem
                icon={<Shield className="h-5 w-5 text-green-600" />}
                title={t('benefitPrioritySupport')}
                description={t('benefitPrioritySupportDesc')}
                badge={t('badgePriority')}
              />
              <BenefitItem
                icon={<Gift className="h-5 w-5 text-purple-600" />}
                title={t('benefitExclusiveOffers')}
                description={t('benefitExclusiveOffersDesc')}
                badge={t('badgeExclusive')}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How It Works Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            {t('howItWorksTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProcessStep
              step="1"
              title={t('step1Title')}
              description={t('step1Desc')}
              icon={<Crown className="h-6 w-6" />}
            />
            <ProcessStep
              step="2"
              title={t('step2Title')}
              description={t('step2Desc')}
              icon={<Star className="h-6 w-6" />}
            />
            <ProcessStep
              step="3"
              title={t('step3Title')}
              description={t('step3Desc')}
              icon={<ArrowRight className="h-6 w-6" />}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Benefit Item Component
interface BenefitItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge: string;
}

function BenefitItem({ icon, title, description, badge }: BenefitItemProps) {
  const locale = useLocale() as 'en' | 'ar';
  const { isRTL, direction } = useRTL();
  
  return (
    <div 
      className={cn(
        "flex items-start gap-3 membership-benefits-list",
        isRTL ? "flex-row-reverse" : "flex-row"
      )}
      dir={direction}
    >
      <div className="p-2 bg-gray-50 rounded-lg flex-shrink-0">
        {icon}
      </div>
      <div className={cn("flex-1 space-y-1", isRTL ? "text-right" : "text-left")}>
        <div className={cn(
          "flex items-center gap-2",
          isRTL ? "flex-row-reverse" : "flex-row"
        )}>
          <h4 className="font-medium">{title}</h4>
          <Badge variant="outline" className="text-xs">
            {badge}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
    </div>
  );
}

// Process Step Component
interface ProcessStepProps {
  step: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function ProcessStep({ step, title, description, icon }: ProcessStepProps) {
  const locale = useLocale() as 'en' | 'ar';
  const { isRTL, direction } = useRTL();
  
  return (
    <div 
      className={cn("space-y-3 membership-content", isRTL ? "text-right" : "text-center")}
      dir={direction}
    >
      <div className="relative">
        <div className="w-12 h-12 bg-atp-gold/10 rounded-full flex items-center justify-center mx-auto">
          {icon}
        </div>
        <div className={cn(
          "absolute -top-1 w-6 h-6 bg-atp-gold text-white rounded-full flex items-center justify-center text-xs font-bold",
          isRTL ? "-left-1" : "-right-1"
        )}>
          {step}
        </div>
      </div>
      <div>
        <h4 className="font-medium mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// Export wrapped with error boundary
export function AtpMembershipSignupWithErrorBoundary(props: AtpMembershipSignupProps) {
  return (
    <MembershipFormErrorBoundary>
      <AtpMembershipSignup {...props} />
    </MembershipFormErrorBoundary>
  );
}

// Export the wrapped version as default
export default AtpMembershipSignupWithErrorBoundary;