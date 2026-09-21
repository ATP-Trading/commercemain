import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { DirectionProvider } from '@/components/ui/direction';
import en from '@/messages/en.json';
import ar from '@/messages/ar.json';

/** Real storefront translation/direction providers; no network or membership service. */
export function TestProviders({ children, locale = 'en' }: {
  children: ReactNode;
  locale?: 'en' | 'ar';
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={locale === 'ar' ? ar : en} timeZone="Asia/Dubai">
      <DirectionProvider dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale}>{children}</div>
      </DirectionProvider>
    </NextIntlClientProvider>
  );
}
