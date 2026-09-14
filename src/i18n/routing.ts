import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'ar'],

  // Used when no locale matches
  defaultLocale: 'en',
  alternateLinks: false
});

/**
 * Get pathname with locale prefix
 */
export function getPathnameWithLocale(pathname: string, locale: string): string {
  // Remove existing locale prefix if present
  const cleanPath = pathname.replace(/^\/(en|ar)/, '');
  return `/${locale}${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
}

/**
 * Detect locale from Accept-Language header
 */
export function detectLocaleFromHeader(acceptLanguage?: string): string {
  if (!acceptLanguage) return 'en';
  
  // Parse Accept-Language header
  const preferred = acceptLanguage.split(',')
    .map(lang => lang.split(';')[0].trim().toLowerCase())
    .find(lang => lang.startsWith('ar') || lang.startsWith('en'));
  
  if (preferred?.startsWith('ar')) return 'ar';
  return 'en';
}

/**
 * Normalize locale string to supported locale
 */
export function normalizeLocale(locale?: string): 'en' | 'ar' {
  if (!locale) return 'en';
  const normalized = locale.toLowerCase().trim();
  if (normalized.startsWith('ar')) return 'ar';
  return 'en';
}
