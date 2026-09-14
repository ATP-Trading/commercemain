"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRTL } from "@/hooks/use-rtl"
import { Mail, Loader2, Shield, Zap, Users } from "lucide-react"
import { Link } from "@/src/i18n/navigation"
import { localizedReturnPath } from "@/lib/auth/return-path"
import { useTranslations, useLocale } from 'next-intl'
import { useCustomerOAuth } from '@/hooks/use-customer-oauth'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SignupFormOAuth() {
  const t = useTranslations('auth')
  const { isRTL } = useRTL()
  const { login, isLoggedIn, isLoading } = useCustomerOAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const returnTo = localizedReturnPath(searchParams.get('returnTo'), useLocale())
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn && !isLoading) {
      router.push(returnTo)
    }
  }, [isLoggedIn, isLoading, router, returnTo])

  const handleCreateAccount = () => {
    // OAuth flow handles both login and signup
    // Pass signup hint to show user this is for creating an account
    setIsRedirecting(true)
    login(returnTo)
  }

  const benefits = [
    { icon: Shield, label: t('benefitSecure') || "Secure & passwordless" },
    { icon: Zap, label: t('benefitQuick') || "Quick one-click sign in" },
    { icon: Users, label: t('benefitExclusive') || "Exclusive member benefits" },
  ]

  return (
    <div className={isRTL ? "font-arabic" : ""}>
      <Card className="w-full max-w-md mx-auto atp-card">
        <CardHeader className={`text-center ${isRTL ? "text-right" : ""}`}>
          <CardTitle className="text-2xl font-bold">{t('createAccount') || 'Create Account'}</CardTitle>
          <CardDescription className="text-base mt-2">
            {t('oauthSignupDescription') || 'Join ATP Trading with secure, passwordless authentication'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error === 'auth_failed' ? (t('authFailed') || 'Authentication failed. Please try again.') : 
                 error === 'invalid_state' ? (t('invalidState') || 'Session expired. Please try again.') : 
                 t('unknownError') || 'An error occurred. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Benefits list */}
          <div className="space-y-3 py-4">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-3 text-muted-foreground ${isRTL ? "flex-row-reverse text-right" : ""}`}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-atp-gold/10 rounded-full flex items-center justify-center">
                  <benefit.icon className="w-4 h-4 text-atp-gold" />
                </div>
                <span className="text-sm">{benefit.label}</span>
              </div>
            ))}
          </div>

          {/* Main CTA Button */}
          <Button 
            type="button"
            onClick={handleCreateAccount}
            className="w-full atp-button-gold h-12 text-base"
            disabled={isLoading || isRedirecting || isLoggedIn}
          >
            {isLoading || isRedirecting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t('redirecting') || 'Redirecting...'}
              </>
            ) : (
              <>
                <Mail className="mr-2 h-5 w-5" />
                {t('continueWithEmail') || 'Continue with Email'}
              </>
            )}
          </Button>

          {/* How it works */}
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground text-center mb-3">
              {t('howItWorks') || 'How it works:'}
            </p>
            <ol className={`text-sm text-muted-foreground space-y-2 ${isRTL ? "text-right" : ""}`}>
              {[1, 2, 3, 4].map(step => (
                <li key={step} className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-atp-gold/20 rounded-full flex items-center justify-center text-xs font-medium text-atp-gold">{step}</span>
                  <span>{t(`howItWorksStep${step}`)}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Terms notice */}
          <p className={`text-xs text-muted-foreground text-center ${isRTL ? "text-right" : ""}`}>
            {t('byCreatingAccount') || 'By creating an account, you agree to our'}{" "}
            <Link href="/policies/terms-of-service" className="text-atp-gold hover:underline">
              {t('termsOfService') || 'Terms of Service'}
            </Link>{" "}
            {t('and') || 'and'}{" "}
            <Link href="/policies/privacy-policy" className="text-atp-gold hover:underline">
              {t('privacyPolicy') || 'Privacy Policy'}
            </Link>
          </p>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t('alreadyHaveAccount') || 'Already have an account?'}
              </span>
            </div>
          </div>

          {/* Login link */}
          <div className="text-center">
            <Link 
              href={`/login?returnTo=${encodeURIComponent(returnTo)}`}
              className="text-atp-gold hover:underline font-medium text-sm"
            >
              {t('signInInstead') || 'Sign in instead'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
