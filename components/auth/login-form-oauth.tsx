'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCustomerOAuth } from '@/hooks/use-customer-oauth'
import { Loader2, Mail, ArrowRight, ShieldCheck } from 'lucide-react'
import { Link } from '@/src/i18n/navigation'
import { localizedReturnPath } from '@/lib/auth/return-path'
import { useTranslations, useLocale } from 'next-intl'

/**
 * OAuth-based Login Form for New Shopify Customer Accounts
 * 
 * This replaces the legacy email/password form with a "Sign in with Shopify" button
 * that initiates the OAuth 2.0 + PKCE flow with passwordless authentication.
 */
export function LoginFormOAuth() {
  const [isRedirecting, setIsRedirecting] = useState(false)
  const { login, isLoggedIn, isLoading } = useCustomerOAuth()
  const searchParams = useSearchParams()
  const t = useTranslations('auth')

  // Get error from URL if redirected back with error
  const error = searchParams.get('error')
  const returnTo = localizedReturnPath(searchParams.get('returnTo'), useLocale())

  // If already logged in, redirect
  useEffect(() => {
    if (isLoggedIn && !isLoading) {
      window.location.href = returnTo
    }
  }, [isLoggedIn, isLoading, returnTo])

  const handleLogin = () => {
    setIsRedirecting(true)
    login(returnTo)
  }

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t('signIn')}</CardTitle>
        <CardDescription className="mt-2">
          {t('signInDescriptionOAuth') || 'Sign in securely with a one-time code sent to your email'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {t(error === 'session_expired' || error === 'invalid_state' ? 'invalidState' : 'authFailed')}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Sign In Button */}
        <Button 
          onClick={handleLogin}
          disabled={isRedirecting}
          className="w-full h-12 text-base font-medium"
          size="lg"
        >
          {isRedirecting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t('redirecting') || 'Redirecting...'}
            </>
          ) : (
            <>
              <Mail className="mr-2 h-5 w-5" />
              {t('continueWithEmail') || 'Continue with Email'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4" />
          <span>{t('securePasswordless') || 'Secure passwordless authentication'}</span>
        </div>

        {/* How it works */}
        <div className="border rounded-lg p-4 bg-muted/50">
          <h4 className="font-medium mb-2 text-sm">{t('howItWorks') || 'How it works'}</h4>
          <ol className="text-sm text-muted-foreground space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="font-medium text-foreground">1.</span>
              {t('howItWorksStep1') || 'Click the button above to continue'}
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-foreground">2.</span>
              {t('howItWorksStep2') || 'Enter your email address'}
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-foreground">3.</span>
              {t('howItWorksStep3') || 'Check your email for a one-time code'}
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-foreground">4.</span>
              {t('howItWorksStep4') || 'Enter the code to sign in'}
            </li>
          </ol>
        </div>

        {/* Links */}
        <div className="text-center text-sm text-muted-foreground">
          {t('noAccount') || "Don't have an account?"}{' '}
          <Link 
            href={`/signup?returnTo=${encodeURIComponent(returnTo)}`} 
            className="text-primary hover:underline font-medium"
          >
            {t('createAccount') || 'Create one'}
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

// Re-export the original form for backwards compatibility
export { LoginFormOAuth as LoginForm }
