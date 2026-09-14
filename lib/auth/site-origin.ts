/** Use trusted deployment configuration, never a request Host header, for OAuth redirects. */
export function customerAccountOrigin(env: Record<string, string | undefined>): string {
  const configured = env.SHOPIFY_CUSTOMER_ACCOUNT_SITE_URL
  const previewHost = env.VERCEL_ENV === 'preview' ? env.VERCEL_BRANCH_URL : undefined
  const candidate = configured || (previewHost ? `https://${previewHost}` : env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
  const url = new URL(candidate)
  if (url.username || url.password || (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)))) {
    throw new Error('Invalid customer account site URL')
  }
  // Production uses www; keep OAuth on the same host as the session cookies.
  if (env.VERCEL_ENV === 'production' && url.hostname === 'atpgroupservices.ae') {
    url.hostname = 'www.atpgroupservices.ae'
  }
  return url.origin
}
