import { customerAccountOrigin } from '@/lib/auth/site-origin'
/**
 * Shopify Customer Account API OAuth Implementation
 * 
 * This implements OAuth 2.0 with PKCE for the new Shopify Customer Accounts.
 * Reference: https://shopify.dev/docs/api/customer
 */

import { cookies } from 'next/headers'

// Environment configuration
const getConfig = () => {
  const shopDomain = process.env.SHOPIFY_STORE_DOMAIN
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID
  const clientSecret = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET
  const shopId = process.env.SHOPIFY_SHOP_ID
  const siteUrl = customerAccountOrigin(process.env)
  
  // Custom OAuth endpoints (for stores with custom account domains)
  const customAuthUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_AUTH_URL
  const customTokenUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_TOKEN_URL
  const customLogoutUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_URL
  
  // Extract account domain from custom auth URL (e.g., "account.atpgroupservices.ae")
  let accountDomain = shopDomain
  if (customAuthUrl) {
    try {
      const authUrl = new URL(customAuthUrl)
      accountDomain = authUrl.hostname
    } catch {
      // If parsing fails, fall back to shop domain
    }
  }

  if (!shopDomain) {
    throw new Error('SHOPIFY_STORE_DOMAIN is required')
  }

  return {
    shopDomain,
    accountDomain, // The domain where Customer Account API is hosted
    clientId: clientId || '',
    clientSecret: clientSecret || '',
    shopId: shopId || '',
    siteUrl,
    redirectUri: `${siteUrl}/api/auth/callback`,
    logoutRedirectUri: siteUrl,
    scopes: 'openid email customer-account-api:full',
    // Custom endpoints for stores with custom account domains
    customAuthUrl,
    customTokenUrl,
    customLogoutUrl,
  }
}

// OAuth endpoints derived from shop domain
const getOAuthEndpoints = (shopDomain: string) => {
  // The authorization and token endpoints use the customer accounts domain
  // Format: https://shopify.com/{shop_id}/auth/oauth/authorize
  const shopId = process.env.SHOPIFY_SHOP_ID
  
  return {
    // Discovery endpoint for OpenID configuration
    discoveryUrl: `https://${shopDomain}/.well-known/openid-configuration`,
    // Customer Account API endpoint
    customerAccountApiUrl: `https://${shopDomain}/.well-known/customer-account-api`,
    // These will be fetched from discovery, but we have defaults
    authorizationEndpoint: `https://shopify.com/${shopId}/auth/oauth/authorize`,
    tokenEndpoint: `https://shopify.com/${shopId}/auth/oauth/token`,
    logoutEndpoint: `https://shopify.com/${shopId}/auth/logout`,
  }
}

// Discover OAuth endpoints dynamically
export async function discoverOAuthEndpoints() {
  const config = getConfig()
  
  // If custom endpoints are provided, use them directly
  if (config.customAuthUrl && config.customTokenUrl && config.customLogoutUrl) {
    console.log('[OAuth] Using custom OAuth endpoints')
    return {
      authorizationEndpoint: config.customAuthUrl,
      tokenEndpoint: config.customTokenUrl,
      logoutEndpoint: config.customLogoutUrl,
      issuer: `https://${config.shopDomain}`,
    }
  }
  
  try {
    // Try the OpenID discovery endpoint
    const discoveryUrl = `https://${config.shopDomain}/.well-known/openid-configuration`
    const response = await fetch(discoveryUrl, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (response.ok) {
      const data = await response.json()
      return {
        authorizationEndpoint: data.authorization_endpoint,
        tokenEndpoint: data.token_endpoint,
        logoutEndpoint: data.end_session_endpoint,
        issuer: data.issuer,
      }
    }
  } catch (error) {
    console.warn('[OAuth] Failed to discover endpoints, using defaults:', error)
  }

  // Fallback to constructed endpoints
  const endpoints = getOAuthEndpoints(config.shopDomain)
  return {
    authorizationEndpoint: endpoints.authorizationEndpoint,
    tokenEndpoint: endpoints.tokenEndpoint,
    logoutEndpoint: endpoints.logoutEndpoint,
    issuer: `https://${config.shopDomain}`,
  }
}

// ============================================
// PKCE (Proof Key for Code Exchange) Functions
// ============================================

/**
 * Generates a cryptographically random code verifier
 * Must be between 43-128 characters, using unreserved URI characters
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return base64UrlEncode(array)
}

/**
 * Generates the code challenge from the code verifier using SHA-256
 */
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return base64UrlEncode(new Uint8Array(digest))
}

/**
 * Generates a random state parameter for CSRF protection
 */
export function generateState(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Generates a nonce for ID token validation
 */
export function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Base64 URL encode (without padding)
 */
function base64UrlEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer))
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

// ============================================
// Authorization URL Builder
// ============================================

export interface AuthorizationParams {
  codeVerifier: string
  state: string
  nonce: string
  returnTo?: string
}

export async function buildAuthorizationUrl(params: AuthorizationParams): Promise<string> {
  const config = getConfig()
  const endpoints = await discoverOAuthEndpoints()
  const codeChallenge = await generateCodeChallenge(params.codeVerifier)

  const url = new URL(endpoints.authorizationEndpoint)
  
  url.searchParams.set('client_id', config.clientId)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('redirect_uri', config.redirectUri)
  url.searchParams.set('scope', config.scopes)
  url.searchParams.set('state', params.state)
  url.searchParams.set('nonce', params.nonce)
  url.searchParams.set('code_challenge', codeChallenge)
  url.searchParams.set('code_challenge_method', 'S256')

  // Optionally include the return URL in state for post-login redirect
  if (params.returnTo) {
    // We'll encode the returnTo in the state
    const stateData = JSON.stringify({
      csrf: params.state,
      returnTo: params.returnTo,
    })
    url.searchParams.set('state', Buffer.from(stateData).toString('base64url'))
  }

  console.log('[OAuth] Built authorization URL:', url.toString().replace(config.clientId, '[CLIENT_ID]'))
  
  return url.toString()
}

// ============================================
// Token Exchange
// ============================================

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  id_token?: string
  scope: string
}

export interface TokenError {
  error: string
  error_description?: string
}

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<TokenResponse> {
  const config = getConfig()
  const endpoints = await discoverOAuthEndpoints()

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    code,
    code_verifier: codeVerifier,
  })

  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json',
  }

  // For confidential clients, use Basic Auth header (as per Shopify docs)
  // The docs say: "Confidential clients are required to send their client_id and client_secret in the Authorization header."
  if (config.clientSecret) {
    const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')
    headers['Authorization'] = `Basic ${credentials}`
  }

  console.log('[OAuth] Exchanging code for tokens at:', endpoints.tokenEndpoint)
  console.log('[OAuth] Using Basic Auth:', !!config.clientSecret)

  const response = await fetch(endpoints.tokenEndpoint, {
    method: 'POST',
    headers,
    body: body.toString(),
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('[OAuth] Token exchange failed:', data)
    throw new Error(data.error_description || data.error || 'Token exchange failed')
  }

  console.log('[OAuth] Token exchange successful, expires in:', data.expires_in, 'seconds')
  
  return data as TokenResponse
}

// ============================================
// Token Refresh
// ============================================

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const config = getConfig()
  const endpoints = await discoverOAuthEndpoints()

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: config.clientId,
    refresh_token: refreshToken,
  })

  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json',
  }

  // For confidential clients, use Basic Auth header
  if (config.clientSecret) {
    const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')
    headers['Authorization'] = `Basic ${credentials}`
  }

  console.log('[OAuth] Refreshing access token')

  const response = await fetch(endpoints.tokenEndpoint, {
    method: 'POST',
    headers,
    body: body.toString(),
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('[OAuth] Token refresh failed:', data)
    throw new Error(data.error_description || data.error || 'Token refresh failed')
  }

  console.log('[OAuth] Token refresh successful')
  
  return data as TokenResponse
}

// ============================================
// Logout URL Builder
// ============================================

export async function buildLogoutUrl(idTokenHint?: string): Promise<string> {
  const config = getConfig()
  const endpoints = await discoverOAuthEndpoints()

  const url = new URL(endpoints.logoutEndpoint)
  
  if (idTokenHint) {
    url.searchParams.set('id_token_hint', idTokenHint)
  }
  url.searchParams.set('post_logout_redirect_uri', config.logoutRedirectUri)

  return url.toString()
}

// ============================================
// Customer Account API Client
// ============================================

// Use the API version from environment variable, fallback to latest
const CUSTOMER_ACCOUNT_API_VERSION = process.env.SHOPIFY_API_VERSION || '2026-01'

// Cache for discovered API endpoint
let cachedApiEndpoint: string | null = null

/**
 * Clears the cached API endpoint. Call this if you need to force re-discovery.
 */
export function clearApiEndpointCache(): void {
  cachedApiEndpoint = null
  console.log('[CustomerAccountAPI] Cache cleared')
}

/**
 * Discovers the Customer Account API endpoint from the shop's storefront domain.
 * Uses the /.well-known/customer-account-api endpoint for dynamic discovery.
 * Falls back to constructed URL if discovery fails.
 * 
 * IMPORTANT: According to Shopify docs, the discovery endpoint should be called on
 * the STOREFRONT domain (e.g., store.myshopify.com), NOT the account domain.
 */
export async function discoverCustomerAccountApiEndpoint(): Promise<string> {
  // Return cached endpoint if available
  if (cachedApiEndpoint) {
    return cachedApiEndpoint
  }

  const config = getConfig()
  
  // Try discovery endpoint on STOREFRONT domain first (recommended by Shopify)
  try {
    const discoveryUrl = `https://${config.shopDomain}/.well-known/customer-account-api`
    console.log('[CustomerAccountAPI] Discovering API endpoint from:', discoveryUrl)
    
    const response = await fetch(discoveryUrl, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (response.ok) {
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const data = await response.json()
        if (data.graphql_api) {
          const endpoint = data.graphql_api as string
          cachedApiEndpoint = endpoint
          console.log('[CustomerAccountAPI] Discovered endpoint:', endpoint)
          return endpoint
        }
      }
    }
  } catch (error) {
    console.warn('[CustomerAccountAPI] Discovery from storefront domain failed:', error)
  }

  // Also try the account domain as fallback for stores with custom domains
  try {
    const discoveryUrl = `https://${config.accountDomain}/.well-known/customer-account-api`
    console.log('[CustomerAccountAPI] Trying discovery from account domain:', discoveryUrl)
    
    const response = await fetch(discoveryUrl, {
      headers: { 'Accept': 'application/json' },
    })

    if (response.ok) {
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const data = await response.json()
        if (data.graphql_api) {
          const endpoint = data.graphql_api as string
          cachedApiEndpoint = endpoint
          console.log('[CustomerAccountAPI] Discovered endpoint from account domain:', endpoint)
          return endpoint
        }
      }
    }
  } catch (error) {
    console.warn('[CustomerAccountAPI] Discovery from account domain failed:', error)
  }

  // Final fallback: Construct URL from account domain
  // Format: https://{accountDomain}/customer/api/{version}/graphql
  cachedApiEndpoint = `https://${config.accountDomain}/customer/api/${CUSTOMER_ACCOUNT_API_VERSION}/graphql`
  console.log('[CustomerAccountAPI] Using fallback endpoint:', cachedApiEndpoint)
  
  return cachedApiEndpoint
}

export async function queryCustomerAccountApi<T>(
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>
): Promise<{ data: T; errors?: Array<{ message: string }> }> {
  // Discover the API endpoint dynamically
  const apiUrl = await discoverCustomerAccountApiEndpoint()
  const config = getConfig()

  console.log('[CustomerAccountAPI] Making request to:', apiUrl)
  console.log('[CustomerAccountAPI] Access token length:', accessToken?.length || 0)

  // According to Shopify docs, server-side requests MUST include:
  // - Origin header: Required for API authentication (for public clients, check Javascript Origins)
  // - User-Agent header: Required by Shopify (403 error without it)
  // See: https://shopify.dev/docs/api/customer
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': accessToken,
    'User-Agent': 'ATP-Storefront/1.0 (Next.js)',
  }

  // Only add Origin header if siteUrl is configured (required for some configurations)
  if (config.siteUrl) {
    headers['Origin'] = config.siteUrl
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  })

  // Log response headers for debugging 401 errors
  if (response.status === 401) {
    const wwwAuthenticate = response.headers.get('www-authenticate')
    console.error('[CustomerAccountAPI] 401 Unauthorized. www-authenticate:', wwwAuthenticate)
    console.error('[CustomerAccountAPI] Headers sent:', { 
      origin: headers['Origin'],
      hasAuth: !!headers['Authorization'],
      userAgent: headers['User-Agent']
    })
  }

  // Check if we got HTML instead of JSON (common error when endpoint is wrong)
  const contentType = response.headers.get('content-type')
  const isJsonResponse =
    !!contentType &&
    (contentType.includes('application/json') ||
      contentType.includes('application/graphql-response+json'))

  if (!isJsonResponse) {
    const text = await response.text()
    console.error('[CustomerAccountAPI] Received non-JSON response:', {
      contentType,
      status: response.status,
      bodyPreview: text.substring(0, 200),
    })
    throw Object.assign(new Error('Customer Account API returned an invalid response'), { status: response.status })
  }

  const result = await response.json()

  if (!response.ok) {
    console.error('[CustomerAccountAPI] Request failed:', result)
    throw Object.assign(new Error(result.errors?.[0]?.message || 'Customer Account API request failed'), { status: response.status })
  }

  return result
}

// ============================================
// Session Cookie Management
// ============================================

const OAUTH_STATE_COOKIE = 'shopify_oauth_state'
const CODE_VERIFIER_COOKIE = 'shopify_code_verifier'
const NONCE_COOKIE = 'shopify_nonce'
const ACCESS_TOKEN_COOKIE = 'shopify_customer_access_token'
const REFRESH_TOKEN_COOKIE = 'shopify_customer_refresh_token'
const ID_TOKEN_COOKIE = 'shopify_customer_id_token'
const TOKEN_EXPIRY_COOKIE = 'shopify_token_expiry'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

export async function storeOAuthState(state: string, codeVerifier: string, nonce: string) {
  const cookieStore = await cookies()
  
  // These cookies are short-lived, just for the OAuth flow
  const shortLivedOptions = {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 10, // 10 minutes
  }

  cookieStore.set(OAUTH_STATE_COOKIE, state, shortLivedOptions)
  cookieStore.set(CODE_VERIFIER_COOKIE, codeVerifier, shortLivedOptions)
  cookieStore.set(NONCE_COOKIE, nonce, shortLivedOptions)
}

export async function getOAuthState() {
  const cookieStore = await cookies()
  
  return {
    state: cookieStore.get(OAUTH_STATE_COOKIE)?.value,
    codeVerifier: cookieStore.get(CODE_VERIFIER_COOKIE)?.value,
    nonce: cookieStore.get(NONCE_COOKIE)?.value,
  }
}

export async function clearOAuthState() {
  const cookieStore = await cookies()
  
  cookieStore.delete(OAUTH_STATE_COOKIE)
  cookieStore.delete(CODE_VERIFIER_COOKIE)
  cookieStore.delete(NONCE_COOKIE)
}

export async function storeTokens(tokens: TokenResponse) {
  const cookieStore = await cookies()
  
  // Calculate expiry time
  const expiresAt = Date.now() + (tokens.expires_in * 1000)

  // Access token - shorter lived
  cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.access_token, {
    ...COOKIE_OPTIONS,
    maxAge: tokens.expires_in,
  })

  // Token expiry timestamp
  cookieStore.set(TOKEN_EXPIRY_COOKIE, expiresAt.toString(), {
    ...COOKIE_OPTIONS,
    maxAge: tokens.expires_in,
  })

  // Refresh token - longer lived (30 days)
  if (tokens.refresh_token) {
    cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
  }

  // ID token for logout
  if (tokens.id_token) {
    cookieStore.set(ID_TOKEN_COOKIE, tokens.id_token, {
      ...COOKIE_OPTIONS,
      maxAge: tokens.expires_in,
    })
  }
}

export async function getTokens() {
  const cookieStore = await cookies()
  
  return {
    accessToken: cookieStore.get(ACCESS_TOKEN_COOKIE)?.value,
    refreshToken: cookieStore.get(REFRESH_TOKEN_COOKIE)?.value,
    idToken: cookieStore.get(ID_TOKEN_COOKIE)?.value,
    expiresAt: cookieStore.get(TOKEN_EXPIRY_COOKIE)?.value 
      ? parseInt(cookieStore.get(TOKEN_EXPIRY_COOKIE)!.value) 
      : undefined,
  }
}

export async function clearTokens() {
  const cookieStore = await cookies()
  
  cookieStore.delete(ACCESS_TOKEN_COOKIE)
  cookieStore.delete(REFRESH_TOKEN_COOKIE)
  cookieStore.delete(ID_TOKEN_COOKIE)
  cookieStore.delete(TOKEN_EXPIRY_COOKIE)
}

export async function isLoggedIn(): Promise<boolean> {
  const tokens = await getTokens()
  return !!tokens.accessToken
}

export async function getValidAccessToken(): Promise<string | null> {
  const tokens = await getTokens()
  
  if (!tokens.accessToken) {
    return null
  }

  // Check if token is expired or about to expire (within 5 minutes)
  const now = Date.now()
  const bufferTime = 5 * 60 * 1000 // 5 minutes
  
  if (tokens.expiresAt && tokens.expiresAt - bufferTime < now) {
    // Token is expired or about to expire, try to refresh
    if (tokens.refreshToken) {
      try {
        console.log('[OAuth] Access token expired, refreshing...')
        const newTokens = await refreshAccessToken(tokens.refreshToken)
        await storeTokens(newTokens)
        return newTokens.access_token
      } catch (error) {
        console.error('[OAuth] Failed to refresh token:', error)
        await clearTokens()
        return null
      }
    } else {
      // No refresh token, clear everything
      await clearTokens()
      return null
    }
  }

  return tokens.accessToken
}

// ============================================
// Export config getter for use in API routes
// ============================================

export { getConfig }
