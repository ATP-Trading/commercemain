import { cleanup, render, screen, within } from '@testing-library/react';
import { NextIntlClientProvider, useLocale, useTranslations } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';
import en from '@/messages/en.json';
import ar from '@/messages/ar.json';

const catalogs = { en, ar };
type Locale = keyof typeof catalogs;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function CatalogProbe() {
  const locale = useLocale();
  const t = useTranslations('navbar');
  return <><output data-testid="locale">{locale}</output><span data-testid="home">{t('home')}</span></>;
}

function CurrentProvider({ locale }: { locale: Locale }) {
  return <NextIntlClientProvider locale={locale} messages={catalogs[locale]} timeZone="Asia/Dubai"><CatalogProbe /></NextIntlClientProvider>;
}

describe('Current next-intl provider with real storefront catalogs', () => {
  it.each(['en', 'ar'] as const)('renders the actual %s catalog and locale', locale => {
    render(<CurrentProvider locale={locale} />);
    expect(screen.getByTestId('locale').textContent).toBe(locale);
    expect(catalogs[locale].navbar.home.length).toBeGreaterThan(0);
    expect(screen.getByTestId('home').textContent).toBe(catalogs[locale].navbar.home);
  });

  it('updates translated content when the provider locale changes', () => {
    const { rerender } = render(<CurrentProvider locale="en" />);
    expect(screen.getByTestId('home').textContent).toBe(en.navbar.home);
    rerender(<CurrentProvider locale="ar" />);
    expect(screen.getByTestId('locale').textContent).toBe('ar');
    expect(screen.getByTestId('home').textContent).toBe(ar.navbar.home);
    rerender(<CurrentProvider locale="en" />);
    expect(screen.getByTestId('home').textContent).toBe(en.navbar.home);
  });

  it('keeps simultaneous Arabic and English contexts independent', () => {
    render(<><section data-testid="english"><CurrentProvider locale="en" /></section><section data-testid="arabic"><CurrentProvider locale="ar" /></section></>);
    const english = within(screen.getByTestId('english'));
    const arabic = within(screen.getByTestId('arabic'));
    expect(english.getByTestId('locale').textContent).toBe('en');
    expect(english.getByTestId('home').textContent).toBe(en.navbar.home);
    expect(arabic.getByTestId('locale').textContent).toBe('ar');
    expect(arabic.getByTestId('home').textContent).toBe(ar.navbar.home);
  });

  it('does not silently return an English singleton outside its provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<CatalogProbe />)).toThrow();
  });
});

function InterpolationProbe({ count }: { count: number }) {
  const t = useTranslations('probe');
  return <output data-testid="interpolation">{t('summary', { name: 'Saud', count })}</output>;
}

describe('Current translation-engine message handling', () => {
  it.each([[0, 'Hello Saud. No items'], [1, 'Hello Saud. 1 item'], [3, 'Hello Saud. 3 items']] as const)(
    'interpolates values and selects the correct plural form for %s', (count, expected) => {
      render(<NextIntlClientProvider locale="en" timeZone="Asia/Dubai" messages={{ probe: { summary: 'Hello {name}. {count, plural, =0 {No items} one {# item} other {# items}}' } }}><InterpolationProbe count={count} /></NextIntlClientProvider>);
      expect(screen.getByTestId('interpolation').textContent).toBe(expected);
    }
  );
});
