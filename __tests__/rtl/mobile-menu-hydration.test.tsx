import React from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot, type Root } from 'react-dom/client';
import { act, fireEvent, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import { DirectionProvider } from '@/components/ui/direction';
import MobileMenu from '@/components/layout/navbar/mobile-menu';
import en from '@/messages/en.json';
import ar from '@/messages/ar.json';

const navigation = vi.hoisted(() => ({ pathname: '/en', query: new URLSearchParams() }));
vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname, useSearchParams: () => navigation.query,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));
vi.mock('@/hooks/use-customer-oauth', () => ({ useCustomerOAuth: () => ({ customer: null, logout: vi.fn() }) }));
vi.mock('next/link', () => ({ default: ({ href, children, ...props }: React.ComponentProps<"a">) => <a href={href} {...props}>{children}</a> }));
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
afterEach(() => vi.unstubAllGlobals());

describe('mobile menu input readiness across actual SSR and hydration', () => {
  it.each(['en', 'ar'] as const)('%s does not offer a clickable menu before hydration, then enables normal interaction', async locale => {
    navigation.pathname = `/${locale}`;
    const messages = locale === 'ar' ? ar : en;
    const tree = () => <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Dubai">
      <DirectionProvider dir={locale === 'ar' ? 'rtl' : 'ltr'}><MobileMenu /></DirectionProvider>
    </NextIntlClientProvider>;
    const container = document.createElement('div');
    document.body.appendChild(container);
    let root: Root | undefined;
    const recoverable = vi.fn();
    try {
      container.innerHTML = renderToString(tree());
      const button = within(container).getByRole('button', { name: messages.navbar.openMenu });
      expect(button).toBeDisabled();
      await act(async () => { root = hydrateRoot(container, tree(), { onRecoverableError: recoverable }); });
      await waitFor(() => expect(button).toBeEnabled());
      fireEvent.click(button);
      const closeLabel = locale === 'ar' ? 'إغلاق القائمة' : 'Close menu';
      const close = await within(document.body).findByRole('button', { name: closeLabel });
      expect(within(document.body).getByRole('link', { name: messages.navbar.signIn })).toHaveAttribute('href', `/${locale}/login`);
      fireEvent.click(close);
      await waitFor(() => expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument());
      expect(recoverable).not.toHaveBeenCalled();
    } finally {
      if (root) await act(async () => root!.unmount());
      container.remove();
    }
  });
});
