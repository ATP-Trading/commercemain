import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { DirectionProvider } from '@/components/ui/direction'
import { SignupFormOAuth } from '@/components/auth/signup-form-oauth'
import en from '@/messages/en.json'
import ar from '@/messages/ar.json'

const mocks = vi.hoisted(() => ({ login: vi.fn(), push: vi.fn(), query: '', loggedIn: false, loading: false }))
vi.mock('@/hooks/use-customer-oauth', () => ({ useCustomerOAuth: () => ({ login: mocks.login, isLoggedIn: mocks.loggedIn, isLoading: mocks.loading }) }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }), usePathname: () => '/en/signup',
  useSearchParams: () => new URLSearchParams(mocks.query), redirect: vi.fn(), permanentRedirect: vi.fn()
}))
vi.mock('next/link', () => ({ default: ({ children, href, ...props }: React.ComponentProps<"a">) => <a href={href} {...props}>{children}</a> }))
function setup(locale: 'en' | 'ar') {
  const messages = locale === 'ar' ? ar : en
  render(<NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Dubai"><DirectionProvider dir={locale === 'ar' ? 'rtl' : 'ltr'}><SignupFormOAuth /></DirectionProvider></NextIntlClientProvider>)
  return messages.auth
}
beforeEach(() => { vi.clearAllMocks(); mocks.query = ''; mocks.loggedIn = false; mocks.loading = false })

describe('signup navigation', () => {
  it.each(['en', 'ar'] as const)('preserves %s destination and provides working localized links', locale => {
    mocks.query = 'returnTo=%2Faccount%2Forders'
    const t = setup(locale)
    expect(screen.getByRole('link', { name: t.termsOfService })).toHaveAttribute('href', `/${locale}/policies/terms-of-service`)
    expect(screen.getByRole('link', { name: t.privacyPolicy })).toHaveAttribute('href', `/${locale}/policies/privacy-policy`)
    expect(screen.getByRole('link', { name: t.signInInstead })).toHaveAttribute('href', `/${locale}/login?returnTo=${encodeURIComponent(`/${locale}/account/orders`)}`)
    expect(screen.getByText(t.howItWorksStep4)).toBeInTheDocument()
    const button = screen.getByRole('button', { name: t.continueWithEmail })
    fireEvent.click(button)
    fireEvent.click(button)
    expect(mocks.login).toHaveBeenCalledExactlyOnceWith(`/${locale}/account/orders`)
    expect(button).toBeDisabled()
  })
  it('rejects an external destination for signup', () => {
    mocks.query = 'returnTo=https%3A%2F%2Foutside.example'
    const t = setup('ar')
    fireEvent.click(screen.getByRole('button', { name: t.continueWithEmail }))
    expect(mocks.login).toHaveBeenCalledExactlyOnceWith('/ar/account')
  })
  it('redirects an existing customer to their intended page', () => {
    mocks.loggedIn = true
    mocks.query = 'returnTo=%2Far%2Faccount%2Forders'
    setup('ar')
    expect(mocks.push).toHaveBeenCalledWith('/ar/account/orders')
    expect(mocks.login).not.toHaveBeenCalled()
  })
  it('waits for account status before redirecting', () => {
    mocks.loggedIn = true; mocks.loading = true
    setup('en')
    expect(mocks.push).not.toHaveBeenCalled()
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
