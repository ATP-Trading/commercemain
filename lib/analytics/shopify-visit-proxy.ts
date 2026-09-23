/** Narrow, consent-gated Storefront tracking proxy. Never accepts arbitrary GraphQL.
 * See Shopify's custom-headless tracking migration and hydrogen-react useShopifyCookies.
 * This endpoint is independent of cart/checkout; failures must not stop shopping.
 */
export const SHOPIFY_ANALYTICS_SHOP_ID = 'gid://shopify/Shop/72307441902';
export const SHOPIFY_VISIT_QUERY = `query ensureCookies {
  consentManagement {
    cookies(visitorConsent: {analytics: true, marketing: false, preferences: false, saleOfData: false}) { cookieDomain }
  }
}`;
const cookieNames = new Set(['_shopify_essential', '_shopify_analytics', '_shopify_marketing']);
const baseHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  'Vary': 'Origin, Cookie',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow',
};
export type VisitProxyConfig = { domain: string; token: string; origin: string };

export function selectShopifyCookies(value: string): string {
  return value.split(';').map(v => v.trim()).filter(v => cookieNames.has(v.split('=')[0] || '')).join('; ');
}
export function hostOnlyShopifyCookie(value: string): string | null {
  if (!cookieNames.has(value.split('=')[0]?.trim() || '') || /[\r\n]/.test(value)) return null;
  // Forward Shopify-owned values unchanged. Restrict standard cookie attributes to this host.
  const parts = value.split(';').filter(p => !/^\s*(domain|path|samesite)\s*=/i.test(p));
  if (!parts.some(p => /^\s*secure\s*$/i.test(p))) parts.push(' Secure');
  return `${parts.join(';')}; Path=/; SameSite=Lax`;
}
function json(value: object, status = 200, extra?: Headers): Response {
  const headers = new Headers(baseHeaders);
  headers.set('Content-Type', 'application/json');
  extra?.forEach((v, k) => { if (k !== 'set-cookie') headers.set(k, v); });
  for (const cookie of extra?.getSetCookie() || []) headers.append('Set-Cookie', cookie);
  return new Response(JSON.stringify(value), {status, headers});
}
export async function handleShopifyVisitRequest(
  request: Request, config: VisitProxyConfig, fetcher: typeof fetch = fetch,
): Promise<Response> {
  if (request.headers.get('origin') !== config.origin || request.headers.get('x-atp-analytics-consent') !== 'v1') {
    return json({ok: false}, 403);
  }
  if (request.method === 'DELETE') {
    const headers = new Headers(baseHeaders);
    for (const name of ['_shopify_analytics', '_shopify_marketing']) {
      headers.append('Set-Cookie', `${name}=; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=Lax`);
    }
    return new Response(null, {status: 204, headers});
  }
  if (request.method !== 'POST') return json({ok: false}, 405);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ok: false}, 415);
  if (Number(request.headers.get('content-length') || 0) > 256) return json({ok: false}, 413);
  try {
    const text = await request.text();
    if (text.length > 256) return json({ok: false}, 413);
    const body = JSON.parse(text);
    if (!body || body.analytics !== true || Object.keys(body).length !== 1) return json({ok: false}, 400);
  } catch { return json({ok: false}, 400); }
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(config.domain) || !config.token) return json({ok: false}, 503);
  const upstreamHeaders = new Headers({
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': config.token,
    'Origin': config.origin,
  });
  const cookies = selectShopifyCookies(request.headers.get('cookie') || '');
  if (cookies) upstreamHeaders.set('Cookie', cookies);
  const agent = request.headers.get('user-agent');
  if (agent) upstreamHeaders.set('User-Agent', agent);
  try {
    const upstream = await fetcher(`https://${config.domain}/api/unstable/graphql.json`, {
      method: 'POST', headers: upstreamHeaders,
      body: JSON.stringify({query: SHOPIFY_VISIT_QUERY}),
      cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(6000),
    });
    if (!upstream.ok) return json({ok: false}, 503);
    const body = await upstream.json();
    if (body.errors?.length || !body.data?.consentManagement?.cookies) return json({ok: false}, 503);
    const timing = upstream.headers.get('server-timing') || '';
    if (!['_y', '_s', '_cmp'].every(name => new RegExp(`(?:^|,)\\s*${name};`).test(timing))) {
      return json({ok: false}, 503);
    }
    const headers = new Headers({'Server-Timing': timing});
    for (const value of upstream.headers.getSetCookie()) {
      const cookie = hostOnlyShopifyCookie(value);
      if (cookie) headers.append('Set-Cookie', cookie);
    }
    return json({ok: true, shopId: SHOPIFY_ANALYTICS_SHOP_ID}, 200, headers);
  } catch {
    // No upstream bodies, visitor identifiers, tokens, or URLs in logs/errors.
    return json({ok: false}, 503);
  }
}
