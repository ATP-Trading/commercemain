export const PRODUCTION_SITE_URL = 'https://www.atpgroupservices.ae';

/** Canonical metadata must not fall back to a preview deployment hostname. */
export function getSiteUrl(configuredUrl?: string): string {
  if (!configuredUrl) return PRODUCTION_SITE_URL;
  const url = new URL(configuredUrl);
  if (url.hostname === 'atpgroupservices.ae' || url.hostname === 'www.atpgroupservices.ae') {
    return PRODUCTION_SITE_URL;
  }
  return url.origin;
}
