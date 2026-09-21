import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { DirectionProvider } from '@/components/ui/direction';
import MobileMenu from '@/components/layout/navbar/mobile-menu';
import en from '@/messages/en.json';
import ar from '@/messages/ar.json';

// Only framework navigation, customer state and unrelated widgets are mocked.
// The menu, translations, state/effects and Headless UI dialog are real.
const navigation = vi.hoisted(() => ({ pathname: '/en', query: new URLSearchParams() }));
vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useSearchParams: () => navigation.query,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));
vi.mock('@/hooks/use-customer-oauth', () => ({
  useCustomerOAuth: () => ({ customer: null, logout: vi.fn() }),
}));
vi.mock('next/link', () => ({ default: ({ children, href, ...props }: React.ComponentProps<"a">) => <a href={href} {...props}>{children}</a> }));
vi.mock('next/image', () => ({ default: ({ priority, ...props }: React.ComponentProps<"img"> & { priority?: boolean }) => <img {...props} /> }));
vi.mock('@/components/language-switcher', () => ({ LanguageSwitcher: () => null }));
vi.mock('@/components/layout/navbar/search', () => ({ default: () => null, SearchSkeleton: () => null }));

beforeEach(() => {
  navigation.query = new URLSearchParams();
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  vi.stubGlobal('matchMedia', vi.fn().mockImplementation(query => ({
    matches: false, media: query, onchange: null,
    addListener: vi.fn(), removeListener: vi.fn(),
    addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
  })));
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function mount(locale: 'en' | 'ar') {
  navigation.pathname = `/${locale}`;
  const messages = locale === 'ar' ? ar : en;
  const tree = () => <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Dubai">
    <DirectionProvider dir={locale === 'ar' ? 'rtl' : 'ltr'}><MobileMenu /></DirectionProvider>
  </NextIntlClientProvider>;
  const view = render(tree());
  const open = async () => {
    fireEvent.click(screen.getByRole('button', { name: messages.navbar.openMenu }));
    await screen.findByRole('link', { name: messages.navbar.signIn });
  };
  const close = () => screen.getByRole('button', { name: locale === 'ar' ? 'إغلاق القائمة' : 'Close menu' });
  return { ...view, messages, tree, open, close };
}

for (const locale of ['en', 'ar'] as const) {
  describe(`${locale} mobile menu route stability`, () => {
    it.each(['', 'q=Frozen&tag=a&tag=b'])('stays open when a refresh replaces the query object without changing URL: %s', async query => {
      navigation.query = new URLSearchParams(query);
      const view = mount(locale);
      await view.open();
      const original = navigation.query;
      navigation.query = new URLSearchParams(query);
      expect(navigation.query).not.toBe(original);
      expect(navigation.query.toString()).toBe(original.toString());
      view.rerender(view.tree());
      await act(async () => { await new Promise(resolve => setTimeout(resolve, 80)); });
      expect(view.close()).toBeInTheDocument();
      expect(screen.getByRole('link', { name: view.messages.navbar.signIn })).toHaveAttribute('href', `/${locale}/login`);
      fireEvent.click(view.close());
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('closes when the actual query changes', async () => {
      const view = mount(locale); await view.open();
      navigation.query = new URLSearchParams('q=Frozen');
      view.rerender(view.tree());
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('closes when the pathname changes', async () => {
      const view = mount(locale); await view.open();
      navigation.pathname = `/${locale}/cart`;
      view.rerender(view.tree());
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('closes through the explicit close button after ordinary rerenders', async () => {
      const view = mount(locale); await view.open();
      view.rerender(view.tree());
      fireEvent.click(view.close());
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('closes on Escape without navigation', async () => {
      const view = mount(locale); await view.open();
      fireEvent.keyDown(view.close(), { key: 'Escape', code: 'Escape' });
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(navigation.pathname).toBe(`/${locale}`);
    });

    it('closes when resized to desktop', async () => {
      const view = mount(locale); await view.open();
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
      fireEvent(window, new Event('resize'));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });
  });
}
