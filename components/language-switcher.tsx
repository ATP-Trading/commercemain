'use client';

import { usePathname, useRouter } from '@/src/i18n/navigation';
import { useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { Languages } from 'lucide-react';

const localeNames = {
  en: 'English',
  ar: 'العربية'
} as const;

const supportedLocales = ['en', 'ar'] as const;

interface LanguageSwitcherProps {
  showFullText?: boolean;
  variant?: 'default' | 'mobile' | 'footer' | 'compact';
}

export function LanguageSwitcher({ showFullText = false, variant = 'default' }: LanguageSwitcherProps = {}) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const handleLocaleChange = (newLocale: string) => {
    const search = new URLSearchParams(window.location.search);
    const query = Object.fromEntries(Array.from(new Set(search.keys()), key => {
      const values = search.getAll(key);
      return [key, values.length > 1 ? values : values[0]];
    }));
    router.replace(
      // @ts-expect-error -- TypeScript will validate that only known params
      // are used in combination with a given pathname. Since the two will
      // always match for the current route, we can skip runtime checks.
      { pathname, params, query, hash: window.location.hash },
      { locale: newLocale }
    );
  };

  const isMobile = variant === 'mobile';
  const isFooter = variant === 'footer';

  if (variant === 'compact') {
    const nextLocale = locale === 'ar' ? 'en' : 'ar';
    return (
      <button
        type="button"
        onClick={() => handleLocaleChange(nextLocale)}
        lang={nextLocale}
        dir={nextLocale === 'ar' ? 'rtl' : 'ltr'}
        aria-label={nextLocale === 'ar' ? 'التبديل إلى العربية' : 'Switch to English'}
        className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-atp-gold/60 bg-neutral-900 px-2.5 text-sm font-semibold text-white hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atp-gold"
      >
        <Languages className="h-4 w-4 shrink-0 text-atp-gold" aria-hidden="true" />
        {localeNames[nextLocale]}
      </button>
    );
  }

  // Footer variant uses a native select element
  if (isFooter) {
    return (
      <select
        aria-label={locale === "ar" ? "لغة الموقع" : "Site language"}
        value={locale}
        onChange={(e) => handleLocaleChange(e.target.value)}
        className="bg-neutral-800 border border-neutral-700 text-white px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
      >
        {supportedLocales.map((loc) => (
          <option key={loc} value={loc}>
            {localeNames[loc]}
          </option>
        ))}
      </select>
    );
  }

  // Mobile variant - vertical list
  if (isMobile) {
    return (
      <div className="flex flex-col gap-2">
        {supportedLocales.map((loc) => (
          <button
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
              locale === loc
                ? 'bg-yellow-400/20 text-yellow-400 font-medium'
                : 'text-white hover:bg-gray-800 hover:text-yellow-400'
            }`}
          >
            {localeNames[loc]}
          </button>
        ))}
      </div>
    );
  }

  // Default: Inline "English | Arabic" format
  return (
    <div className="flex items-center text-sm">
      <button
        onClick={() => handleLocaleChange('en')}
        className={`transition-colors ${
          locale === 'en'
            ? 'text-yellow-400 font-medium'
            : 'text-white/70 hover:text-white'
        }`}
      >
        English
      </button>
      <span className="text-white/40 mx-2">|</span>
      <button
        onClick={() => handleLocaleChange('ar')}
        className={`transition-colors ${
          locale === 'ar'
            ? 'text-yellow-400 font-medium'
            : 'text-white/70 hover:text-white'
        }`}
      >
        العربية
      </button>
    </div>
  );
}
