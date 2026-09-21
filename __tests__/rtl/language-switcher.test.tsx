import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { LanguageSwitcher } from '@/components/language-switcher';

// Use the real component and next-intl locale. Only the routing boundary is mocked.
// The retired useRTL/dropdown/flag implementation is no longer this component's API.
const navigation = vi.hoisted(() => ({
  replace: vi.fn(),
  pathname: '/product/[handle]',
  params: { handle: 'phytovy-liv' },
}));
vi.mock('@/src/i18n/navigation', () => ({
  useRouter: () => ({ replace: navigation.replace }),
  usePathname: () => navigation.pathname,
}));
vi.mock('next/navigation', () => ({ useParams: () => navigation.params }));

type Locale = 'en' | 'ar';
type Variant = 'default' | 'mobile' | 'footer' | 'compact';
const names = { en: 'English', ar: 'العربية' } as const;
const originalUrl = window.location.href;
function setup(locale: Locale, variant: Variant = 'default') {
  return render(
    <NextIntlClientProvider locale={locale} messages={{}} timeZone="Asia/Dubai">
      <LanguageSwitcher variant={variant} />
    </NextIntlClientProvider>
  );
}
function changeLanguage(locale: Locale, variant: Variant) {
  const target = locale === 'en' ? 'ar' : 'en';
  if (variant === 'footer') {
    fireEvent.change(screen.getByRole('combobox', { name: locale === 'ar' ? 'لغة الموقع' : 'Site language' }), { target: { value: target } });
  } else {
    const name = variant === 'compact'
      ? target === 'ar' ? 'التبديل إلى العربية' : 'Switch to English'
      : names[target];
    fireEvent.click(screen.getByRole('button', { name }));
  }
  return target;
}
beforeEach(() => {
  vi.clearAllMocks();
  window.history.replaceState({}, '', '/en/product/phytovy-liv');
});
afterEach(() => {
  cleanup();
  window.history.replaceState({}, '', originalUrl);
});

describe('LanguageSwitcher current variants', () => {
  it.each(['en', 'ar'] as const)('renders native language names and highlights the active %s option', locale => {
    setup(locale);
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'English' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'العربية' })).toBeVisible();
    expect(screen.getByRole('button', { name: names[locale] })).toHaveClass('font-medium', 'text-yellow-400');
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  for (const locale of ['en', 'ar'] as const) {
    it.each(['default', 'mobile', 'footer', 'compact'] as const)(`switches from ${locale} using the %s variant`, variant => {
      setup(locale, variant);
      const target = changeLanguage(locale, variant);
      expect(navigation.replace).toHaveBeenCalledExactlyOnceWith(
        { pathname: '/product/[handle]', params: { handle: 'phytovy-liv' }, query: {}, hash: '' },
        { locale: target }
      );
    });
  }

  it.each(['en', 'ar'] as const)('preserves route parameters, repeated query values and fragment when leaving %s', locale => {
    window.history.replaceState({}, '', `/${locale}/product/phytovy-liv?sort=price&tag=one&tag=two&empty=#details`);
    setup(locale);
    const target = changeLanguage(locale, 'default');
    expect(navigation.replace).toHaveBeenCalledExactlyOnceWith(
      { pathname: '/product/[handle]', params: { handle: 'phytovy-liv' }, query: { sort: 'price', tag: ['one', 'two'], empty: '' }, hash: '#details' },
      { locale: target }
    );
  });

  it.each(['en', 'ar'] as const)('gives the compact switch correct language, direction and accessible name from %s', locale => {
    setup(locale, 'compact');
    const target = locale === 'en' ? 'ar' : 'en';
    const button = screen.getByRole('button', { name: target === 'ar' ? 'التبديل إلى العربية' : 'Switch to English' });
    expect(button).toHaveTextContent(names[target]);
    expect(button).toHaveAttribute('lang', target);
    expect(button).toHaveAttribute('dir', target === 'ar' ? 'rtl' : 'ltr');
    expect(button).toHaveAttribute('type', 'button');
    expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it.each(['en', 'ar'] as const)('labels the footer select and displays the selected %s value', locale => {
    setup(locale, 'footer');
    expect(screen.getByRole('combobox', { name: locale === 'ar' ? 'لغة الموقع' : 'Site language' })).toHaveValue(locale);
    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(screen.getByRole('option', { name: names[locale] })).toHaveProperty('selected', true);
  });

  it.each(['en', 'ar'] as const)('marks the active mobile option in %s', locale => {
    setup(locale, 'mobile');
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.getByRole('button', { name: names[locale] })).toHaveClass('bg-yellow-400/20', 'font-medium');
  });
});
