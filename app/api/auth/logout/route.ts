import { safeReturnPath } from '@/lib/auth/return-path'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createCart, getCart, updateCartBuyerIdentity } from '@/lib/shopify/server'
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
  // A cart can outlive the login cookies. Remove the previous buyer so that
  // customer-specific prices and checkout identity do not survive sign-out.
  const cookieStore = await cookies()
  if (cookieStore.get('cartId')?.value) {
    let previousCart: Awaited<ReturnType<typeof getCart>>
    try {
      previousCart = await getCart()
      const { cart, userErrors } = await updateCartBuyerIdentity({
        customerAccessToken: null,
        email: null,
        phone: null,
      })
      if (!cart || userErrors.length || cart.buyerIdentity?.customer) {
        throw new Error('Cart buyer was not detached')
      }
    } catch {
      // A completed/older cart can reject identity changes. Copy only its
      // purchase lines into a new guest cart, not its customer or discounts.
      cookieStore.delete('cartId')
      if (previousCart?.lines.length) {
        try {
          await createCart(previousCart.lines.map(line => ({
            merchandiseId: line.merchandise.id,
            quantity: line.quantity,
            ...(line.sellingPlanAllocation?.sellingPlan.id ? { sellingPlanId: line.sellingPlanAllocation.sellingPlan.id } : {}),
          })))
        } catch {
          // Sign-out must still complete if stock changes or Shopify is down.
          cookieStore.delete('cartId')
        }
      }
    }
  }
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
