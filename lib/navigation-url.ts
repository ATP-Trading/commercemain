const storefrontHosts = new Set(["atpgroupservices.ae", "www.atpgroupservices.ae"]);

export function normalizeNavigationUrl(value?: string | null): string {
  if (!value) return "";
  try {
    const url = new URL(value);
    // Shopify menus can use the checkout host for their storefront home link.
    // Only normalize its homepage; real checkout/account URLs stay external.
    if (url.hostname === "checkout.atpgroupservices.ae" && /^\/(?:en|ar)?\/?$/.test(url.pathname)) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
    if (!storefrontHosts.has(url.hostname)) return value;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return value;
  }
}

export function localizeNavigationPath(path: string, locale: string): string {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const clean = normalized.replace(/^\/(en|ar)(?=\/|[?#]|$)/, "");
  return `/${locale}${clean.startsWith("/") || !clean ? clean : `/${clean}`}`;
}
