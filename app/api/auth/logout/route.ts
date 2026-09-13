import { safeReturnPath } from '@/lib/auth/return-path'
import { NextRequest, NextResponse } from 'next/server'
import {
  getTokens,
  clearTokens,
  buildLogoutUrl,
  getConfig,
} from '@/lib/shopify/customer-account-oauth'

export async function GET(request: NextRequest) {
  return handleLogout(request)
}

export async function POST(request: NextRequest) {
  return handleLogout(request)
}

async function handleLogout(request: NextRequest) {
  try {
    const config = getConfig()
    
    // Get the current tokens to get the ID token for logout hint
    const tokens = await getTokens()

    // Clear all auth tokens from cookies
    await clearTokens()

    console.log('[Auth/Logout] Cleared local session')

    // If we have an ID token, redirect to Shopify's logout endpoint
    // This will properly log the user out of Shopify's session as well
    if (tokens.idToken) {
      try {
        const logoutUrl = await buildLogoutUrl(tokens.idToken)
        console.log('[Auth/Logout] Redirecting to Shopify logout')
        return NextResponse.redirect(logoutUrl)
      } catch (error) {
        console.warn('[Auth/Logout] Failed to build logout URL, skipping Shopify logout:', error)
      }
    }

    // Get returnTo from query params or default to home
    const { searchParams } = new URL(request.url)
    const returnTo = safeReturnPath(searchParams.get('returnTo'), '/')

    console.log('[Auth/Logout] Logout complete, redirecting to:', returnTo)

    // Redirect to home or specified page
    return NextResponse.redirect(new URL(returnTo, config.siteUrl))
  } catch (error) {
    console.error('[Auth/Logout] Error during logout:', error)
    
    // Even if logout fails, clear cookies and redirect
    await clearTokens()
    
    const config = getConfig()
    return NextResponse.redirect(new URL('/', config.siteUrl))
  }
}

export const dynamic = 'force-dynamic'
