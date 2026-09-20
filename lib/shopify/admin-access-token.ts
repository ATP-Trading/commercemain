import 'server-only';

type CachedToken = { key: string; value: string; expiresAt: number };
let cached: CachedToken | undefined;
let pending: { key: string; promise: Promise<string> } | undefined;

/** Only ATP-owned client credentials are accepted after the production migration. */
export async function getAdminAccessToken(): Promise<string> {
  const clientId = process.env.SHOPIFY_ADMIN_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_ADMIN_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('Shopify Admin client credentials are incomplete');
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  if (!domain || !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(domain)) {
    throw new Error('Invalid Shopify store domain');
  }
  const key = JSON.stringify([domain, clientId, clientSecret]);
  if (cached?.key === key && cached.expiresAt > Date.now()) return cached.value;
  if (pending?.key === key) return pending.promise;
  const promise = (async () => {
    const startedAt = Date.now();
    const response = await fetch(`https://${domain}/admin/oauth/access_token`, {
      method: 'POST', cache: 'no-store', redirect: 'error',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error('Shopify Admin token request failed');
    const result = await response.json();
    if (typeof result.access_token !== 'string' || !result.access_token ||
        typeof result.expires_in !== 'number' || !Number.isFinite(result.expires_in) || result.expires_in <= 60) {
      throw new Error('Invalid Shopify Admin token response');
    }
    cached = { key, value: result.access_token, expiresAt: startedAt + (result.expires_in - 60) * 1000 };
    return cached.value;
  })();
  pending = { key, promise };
  try { return await promise; }
  finally { if (pending?.promise === promise) pending = undefined; }
}
