import React from 'react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { DirectionProvider } from '@/components/ui/direction';
import { LoginFormOAuth } from '@/components/auth/login-form-oauth';
import MobileMenu from '@/components/layout/navbar/mobile-menu';
import en from '@/messages/en.json';
import ar from '@/messages/ar.json';

// Render the actual components, translations, cards, buttons and Headless UI
// dialog. Only the auth/network boundary and unrelated header widgets are mocked.
const state = vi.hoisted(() => ({
  login: vi.fn(), logout: vi.fn(), push: vi.fn(),
  customer: null as null | { id: string; firstName: string },
  isLoggedIn: false, isLoading: false,
  pathname: '/en/login', query: new URLSearchParams(),
}));
vi.mock('@/hooks/use-customer-oauth', () => ({ useCustomerOAuth: () => ({
  customer: state.customer, isLoggedIn: state.isLoggedIn,
  isLoading: state.isLoading, error: null,
  login: state.login, logout: state.logout, refreshCustomer: vi.fn(),
}) }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: state.push, replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => state.pathname,
  useSearchParams: () => state.query,
  redirect: vi.fn(), permanentRedirect: vi.fn(),
}));
vi.mock('next/link', () => ({ default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a> }));
vi.mock('next/image', () => ({ default: ({ priority, ...props }: any) => <img {...props} /> }));
vi.mock('@/components/language-switcher', () => ({ LanguageSwitcher: () => <span data-testid="language-widget-placeholder" /> }));
vi.mock('@/components/layout/navbar/search', () => ({ default: () => <span data-testid="search-placeholder" />, SearchSkeleton: () => null }));

function setup(locale: 'en' | 'ar', element: React.ReactElement) {
  const messages = locale === 'ar' ? ar : en;
  state.pathname = `/${locale}/login`;
  const view = render(<NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Dubai">
    <DirectionProvider dir={locale === 'ar' ? 'rtl' : 'ltr'}>{element}</DirectionProvider>
  </NextIntlClientProvider>);
  return { ...view, messages };
}

beforeEach(() => {
  vi.clearAllMocks();
  state.customer = null; state.isLoggedIn = false; state.isLoading = false;
  state.query = new URLSearchParams();
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  window.matchMedia = vi.fn().mockImplementation(query => ({
    matches: false, media: query, onchange: null,
    addListener: vi.fn(), removeListener: vi.fn(),
    addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
  }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('PR30 actual login component, mocked auth boundary', () => {
  it.each(['en', 'ar'] as const)('%s login preserves destination and prevents duplicate starts', locale => {
    state.query = new URLSearchParams('returnTo=%2Faccount%2Forders');
    const { messages, container } = setup(locale, <LoginFormOAuth />);
    expect(container.querySelector('input[type="password"]')).toBeNull();
    expect(screen.getByRole('link', { name: messages.auth.createAccount })).toHaveAttribute('href', `/${locale}/signup?returnTo=${encodeURIComponent(`/${locale}/account/orders`)}`);
    const button = screen.getByRole('button', { name: messages.auth.continueWithEmail });
    fireEvent.click(button); fireEvent.click(button);
    expect(state.login).toHaveBeenCalledExactlyOnceWith(`/${locale}/account/orders`);
    expect(button).toBeDisabled();
  });
  it.each(['en', 'ar'] as const)('%s login rejects an external return destination', locale => {
    state.query = new URLSearchParams('returnTo=https%3A%2F%2Foutside.example');
    const { messages } = setup(locale, <LoginFormOAuth />);
    fireEvent.click(screen.getByRole('button', { name: messages.auth.continueWithEmail }));
    expect(state.login).toHaveBeenCalledExactlyOnceWith(`/${locale}/account`);
  });
  it.each(['en', 'ar'] as const)('%s login shows the translated expired-session error', locale => {
    state.query = new URLSearchParams('error=invalid_state');
    const { messages } = setup(locale, <LoginFormOAuth />);
    expect(screen.getByRole('alert')).toHaveTextContent(messages.auth.invalidState);
  });
  it.each(['en', 'ar'] as const)('%s login waits for authentication status before offering sign in', locale => {
    state.isLoading = true;
    setup(locale, <LoginFormOAuth />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(state.login).not.toHaveBeenCalled();
  });
});

describe('PR30 actual mobile menu, mocked auth boundary', () => {
  it.each(['en', 'ar'] as const)('%s guest can open and close the menu and gets a localized login link', async locale => {
    const { messages } = setup(locale, <MobileMenu />);
    fireEvent.click(screen.getByRole('button', { name: messages.navbar.openMenu }));
    expect(await screen.findByRole('link', { name: messages.navbar.signIn })).toHaveAttribute('href', `/${locale}/login`);
    expect(screen.queryByRole('button', { name: messages.navbar.signOut })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: locale === 'ar' ? 'إغلاق القائمة' : 'Close menu' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
  it.each(['en', 'ar'] as const)('%s authenticated customer sees Account and invokes the OAuth logout handler', async locale => {
    state.customer = { id: 'test-customer', firstName: 'Test' }; state.isLoggedIn = true;
    const { messages } = setup(locale, <MobileMenu />);
    fireEvent.click(screen.getByRole('button', { name: messages.navbar.openMenu }));
    expect(await screen.findByRole('link', { name: messages.navbar.account })).toHaveAttribute('href', `/${locale}/account`);
    expect(screen.queryByRole('link', { name: messages.navbar.signIn })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: messages.navbar.signOut }));
    expect(state.logout).toHaveBeenCalledExactlyOnceWith();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
