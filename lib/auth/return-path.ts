/** Accept only a path within this storefront, never an external redirect. */
export function safeReturnPath(value: unknown, fallback = '/account'): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u0020\u007f]/.test(value)) {
    return fallback
  }
  try {
    const url = new URL(value, 'https://storefront.invalid')
    if (url.origin !== 'https://storefront.invalid' || url.pathname.startsWith('//')) return fallback
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}

export function localizedReturnPath(value: unknown, locale: string): string {
  const language = locale === 'ar' ? 'ar' : 'en'
  const path = safeReturnPath(value, `/${language}/account`)
  return /^\/(ar|en)(?:\/|\?|#|$)/.test(path) ? path : `/${language}${path}`
}
