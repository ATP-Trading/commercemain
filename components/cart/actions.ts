"use server"

import { getLocale } from "next-intl/server"
import { localizeCheckoutUrl } from "@/lib/cart/checkout-locale"
import { TAGS } from "@/lib/constants"
import {
  addToCart,
  removeFromCart,
  updateCart,
  getCart,
  createCart,
  getCollectionProducts,
  updateCartBuyerIdentity,
} from "@/lib/shopify/server"
import { updateTag } from "next/cache"
import { redirect } from "next/navigation"
import { getValidAccessToken } from "@/lib/shopify/customer-account-oauth"

interface CartActionState {
  error?: string
  success?: boolean
}

// Server action for fetching collection products
export async function fetchCollectionProducts(
  collection: string, 
  sortKey?: string, 
  reverse?: boolean,
  locale?: { language?: string; country?: string }
) {
  try {
    const products = await getCollectionProducts({
      collection,
      ...(sortKey !== undefined && { sortKey }),
      ...(reverse !== undefined && { reverse }),
      ...(locale !== undefined && { locale })
    });
    return { success: true, products }
  } catch (error) {
    console.error('Error fetching collection products:', error)
    return { success: false, error: 'Failed to fetch products', products: [] }
  }
}

export async function addItem(
  prevState: CartActionState,
  selectedVariantId: string | undefined,
): Promise<string | undefined> {
  if (!selectedVariantId) {
    return "Error adding item to cart"
  }

  try {
    await addToCart([{ merchandiseId: selectedVariantId, quantity: 1 }])
    updateTag(TAGS.cart)
    return undefined
  } catch (e) {
    console.error('Error adding item to cart:', e)
    return "Error adding item to cart"
  }
}

export async function removeItem(prevState: CartActionState, merchandiseId: string): Promise<string | undefined> {
  try {
    const cart = await getCart()

    if (!cart) {
      return "Error fetching cart"
    }

    const lineItem = cart.lines.find((line) => line.merchandise.id === merchandiseId)

    if (lineItem && lineItem.id) {
      await removeFromCart([lineItem.id])
      updateTag(TAGS.cart)
      return undefined
    } else {
      return "Item not found in cart"
    }
  } catch (e) {
    console.error('Error removing item from cart:', e)
    return "Error removing item from cart"
  }
}

export async function updateItemQuantity(
  prevState: CartActionState,
  payload: {
    merchandiseId: string
    quantity: number
  },
): Promise<string | undefined> {
  const { merchandiseId, quantity } = payload

  try {
    const cart = await getCart()

    if (!cart) {
      return "Error fetching cart"
    }

    const lineItem = cart.lines.find((line) => line.merchandise.id === merchandiseId)

    if (lineItem && lineItem.id) {
      if (quantity === 0) {
        await removeFromCart([lineItem.id])
      } else {
        await updateCart([
          {
            id: lineItem.id,
            merchandiseId,
            quantity,
          },
        ])
      }
    } else if (quantity > 0) {
      // If the item doesn't exist in the cart and quantity > 0, add it
      await addToCart([{ merchandiseId, quantity }])
    }

    updateTag(TAGS.cart)
    return undefined
  } catch (e) {
    console.error('Error updating item quantity:', e)
    return "Error updating item quantity"
  }
}

/**
 * Get the checkout URL for the current cart.
 * Returns the URL instead of redirecting, allowing the client to perform
 * the redirect to avoid next-intl middleware interference.
 * 
 * For headless storefronts, checkout URLs should point to the checkout subdomain
 * (e.g., checkout.example.com) which is configured as Primary for Online Store
 * in Shopify Admin > Settings > Domains.
 */
export async function getCheckoutUrl(): Promise<string> {
  const cart = await getCart()
  if (!cart) {
    throw new Error('No cart found')
  }

  let checkoutCart = cart

  // Keep checkout logged in by syncing buyer identity when possible.
  // Shopify docs require buyerIdentity.customerAccessToken on the cart before checkout redirect.
  const accessToken = await getValidAccessToken()
  if (accessToken) {
    try {
      const { cart: updatedCart, userErrors } = await updateCartBuyerIdentity({
        customerAccessToken: accessToken,
      })

      if (userErrors.length > 0) {
        console.warn('[Checkout] Failed to sync buyer identity, continuing as guest:', userErrors)
      } else if (updatedCart) {
        checkoutCart = updatedCart
      }
    } catch (error) {
      // Fail open: checkout should still work as guest if identity sync fails.
      console.warn('[Checkout] Buyer identity sync failed, continuing as guest checkout:', error)
    }
  }
  
  let checkoutUrl = checkoutCart.checkoutUrl
  
  // For headless storefronts, we use a dedicated checkout subdomain
  // This subdomain (e.g., checkout.atpgroupservices.ae) is set as Primary for Online Store
  // in Shopify Admin > Settings > Domains, pointing to Shopify's servers
  const checkoutDomain = process.env.SHOPIFY_CHECKOUT_DOMAIN || ''
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN || ''
  
  // Use checkout subdomain if configured, otherwise fall back to myshopify.com domain
  const targetDomain = checkoutDomain || storeDomain
  
  if (checkoutUrl && targetDomain) {
    try {
      // Parse the checkout URL
      const url = new URL(checkoutUrl)
      
      // Rewrite the host to use our checkout domain
      // This ensures checkout goes through checkout.atpgroupservices.ae
      // instead of the headless storefront domain which would 404
      url.host = targetDomain
      url.protocol = 'https:'
      
      checkoutUrl = url.toString()
    } catch (e) {
      // If the URL is relative (starts with /), make it absolute
      if (checkoutUrl.startsWith('/')) {
        checkoutUrl = `https://${targetDomain}${checkoutUrl}`
      } else {
        // Last resort: construct a valid URL
        checkoutUrl = `https://${targetDomain}/${checkoutUrl}`
      }
    }
  }
  
  return localizeCheckoutUrl(checkoutUrl, await getLocale())
}

/**
 * @deprecated Use getCheckoutUrl() instead and handle redirect on client-side
 * to avoid next-intl middleware interference with external URLs.
 */
export async function redirectToCheckout() {
  const checkoutUrl = await getCheckoutUrl()
  // redirect() throws NEXT_REDIRECT by design - don't catch it
  redirect(checkoutUrl)
}

export async function clearCart() {
  try {
    // Note: clearCart function doesn't exist in main Shopify functions
    // We'll need to implement this differently or remove it
    updateTag(TAGS.cart)
  } catch (e) {
    console.error('Error clearing cart:', e)
    throw new Error('Failed to clear cart')
  }
}

export async function createCartAndSetCookie() {
  try {
    const cart = await createCart()
    updateTag(TAGS.cart)
    return cart
  } catch (e) {
    console.error('Error creating cart:', e)
    throw new Error('Failed to create cart')
  }
}

// Enhanced cart actions with optimistic updates
export async function addToCartOptimistic(
  merchandiseId: string,
  quantity: number = 1,
  customerId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // The membership action owns the mutation as well as benefit calculation.
    if (customerId) {
      const { addToCartWithMembership } = await import('./membership-cart-actions')
      const result = await addToCartWithMembership(merchandiseId, quantity, customerId)
      return { success: result.success, ...(result.error ? { error: result.error } : {}) }
    }
    await addToCart([{ merchandiseId, quantity }])
    updateTag(TAGS.cart)

    return { success: true }
  } catch (e) {
    console.error('Error adding to cart:', e)
    return { success: false, error: 'Failed to add item to cart' }
  }
}

export async function removeFromCartOptimistic(
  lineId: string,
  customerId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (customerId) {
      const { removeFromCartWithMembership } = await import('./membership-cart-actions')
      const result = await removeFromCartWithMembership(lineId, customerId)
      return { success: result.success, ...(result.error ? { error: result.error } : {}) }
    }
    await removeFromCart([lineId])
    updateTag(TAGS.cart)

    return { success: true }
  } catch (e) {
    console.error('Error removing from cart:', e)
    return { success: false, error: 'Failed to remove item from cart' }
  }
}

export async function updateCartQuantityOptimistic(
  lineId: string,
  quantity: number,
  customerId?: string,
  merchandiseId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cart = await getCart()
    if (!cart) {
      return { success: false, error: 'No cart found' }
    }

    // First try to find by lineId, then fall back to merchandiseId
    // This handles the case where optimistic updates have stale/undefined lineIds
    let lineItem = cart.lines.find((line) => line.id === lineId)
    
    // If not found by lineId, try to find by merchandiseId (fallback for optimistic updates)
    if (!lineItem && merchandiseId) {
      lineItem = cart.lines.find((line) => line.merchandise.id === merchandiseId)
      console.log('📦 Found item by merchandiseId fallback:', lineItem?.id)
    }
    
    if (!lineItem) {
      console.error('❌ Item not found in cart. LineId:', lineId, 'MerchandiseId:', merchandiseId)
      console.error('❌ Available lines:', cart.lines.map(l => ({ id: l.id, merchandiseId: l.merchandise.id })))
      return { success: false, error: 'Item not found in cart' }
    }

    // Use the actual lineId from the server cart (not the stale one from optimistic state)
    const actualLineId = lineItem.id
    const actualMerchandiseId = lineItem.merchandise.id

    if (!actualLineId || !actualMerchandiseId) {
      return { success: false, error: 'Invalid cart item data' }
    }

    if (customerId) {
      const { updateCartQuantityWithMembership } = await import('./membership-cart-actions')
      const result = await updateCartQuantityWithMembership(actualLineId, actualMerchandiseId, quantity, customerId)
      return { success: result.success, ...(result.error ? { error: result.error } : {}) }
    }

    if (quantity === 0) {
      await removeFromCart([actualLineId])
    } else {
      await updateCart([
        {
          id: actualLineId,
          merchandiseId: actualMerchandiseId,
          quantity,
        },
      ])
    }

    updateTag(TAGS.cart)
    
    
    return { success: true }
  } catch (e) {
    console.error('Error updating cart quantity:', e)
    return { success: false, error: 'Failed to update cart quantity' }
  }
}
