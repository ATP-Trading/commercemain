import { safeReturnPath } from '@/lib/auth/return-path'
import { NextRequest, NextResponse } from 'next/server'
import {
  generateCodeVerifier,
  generateState,
  generateNonce,
  buildAuthorizationUrl,
  storeOAuthState,
  getConfig,
} from '@/lib/shopify/customer-account-oauth'

export async function GET(request: NextRequest) {
  try {
    const config = getConfig()
    
    // Check if OAuth is properly configured
    if (!config.clientId) {
      console.error('[Auth/Login] Missing SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID')
      return NextResponse.json(
        { 
          error: 'OAuth not configured',
          message: 'Customer Account API credentials are not set. Please configure SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID in your environment variables.'
        },
        { status: 500 }
      )
    }

    // Get optional return URL from query params
    const { searchParams } = new URL(request.url)
    const returnTo = safeReturnPath(searchParams.get('returnTo'), '/account')

    // Generate PKCE values
    const codeVerifier = generateCodeVerifier()
    const state = generateState()
    const nonce = generateNonce()

    console.log('[Auth/Login] Initiating OAuth flow, returnTo:', returnTo)

    // Store OAuth state in cookies for validation in callback
    await storeOAuthState(state, codeVerifier, nonce)

    // Build the authorization URL
    const authUrl = await buildAuthorizationUrl({
      codeVerifier,
      state,
      nonce,
      returnTo,
    })

    console.log('[Auth/Login] Redirecting to Shopify authorization')

    // Redirect to Shopify's authorization page
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('[Auth/Login] Error initiating OAuth flow:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to initiate login',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
