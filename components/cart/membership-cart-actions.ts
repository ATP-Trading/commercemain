/**
 * Membership-Enhanced Cart Actions
 * 
 * Server actions that integrate membership benefits with cart operations.
 * Automatically applies discounts and free delivery for active members.
 */

'use server';

import { updateTag } from 'next/cache';
import { TAGS } from '@/lib/constants';
import { 
  addToCart, 
  removeFromCart, 
  updateCart, 
  getCart, 
  createCart 
} from '@/lib/shopify/server';
import { membershipCartMiddleware, EnhancedCart } from '@/lib/cart/membership-cart-middleware';
import { atpMembershipService } from '@/lib/services/atp-membership-service';

interface MembershipCartActionResult {
  success: boolean;
  error?: string;
  cart?: EnhancedCart;
  membershipStatus?: 'active' | 'expired' | 'none';
}

/**
 * Add item to cart with membership benefits
 * Requirement 4.3: Automatically apply member discounts during checkout
 */
export async function addToCartWithMembership(
  merchandiseId: string,
  quantity: number = 1,
  customerId?: string
): Promise<MembershipCartActionResult> {
  try {
    // Add item to cart using standard Shopify action
    await addToCart([{ merchandiseId, quantity }]);
    
    // Get updated cart
    const cart = await getCart();
    if (!cart) {
      return { success: false, error: 'Failed to retrieve cart after adding item' };
    }

    // Apply membership benefits
    const enhancedCart = await membershipCartMiddleware.applyMembershipBenefits(
      cart,
      customerId
    );

    // Revalidate cart cache
    updateTag(TAGS.cart);

    return {
      success: true,
      cart: enhancedCart,
      membershipStatus: enhancedCart.membershipBenefits?.membershipStatus || 'none'
    };

  } catch (error) {
    console.error('Error adding item to cart with membership:', error);
    return { 
      success: false, 
      error: 'Failed to add item to cart' 
    };
  }
}

/**
 * Remove item from cart and recalculate membership benefits
 */
export async function removeFromCartWithMembership(
  lineId: string,
  customerId?: string
): Promise<MembershipCartActionResult> {
  try {
    // Remove item from cart
    await removeFromCart([lineId]);
    
    // Get updated cart
    const cart = await getCart();
    if (!cart) {
      return { success: false, error: 'Failed to retrieve cart after removing item' };
    }

    // Apply membership benefits to updated cart
    const enhancedCart = await membershipCartMiddleware.applyMembershipBenefits(
      cart,
      customerId
    );

    // Revalidate cart cache
    updateTag(TAGS.cart);

    return {
      success: true,
      cart: enhancedCart,
      membershipStatus: enhancedCart.membershipBenefits?.membershipStatus || 'none'
    };

  } catch (error) {
    console.error('Error removing item from cart with membership:', error);
    return { 
      success: false, 
      error: 'Failed to remove item from cart' 
    };
  }
}

/**
 * Update cart item quantity with membership benefits
 */
export async function updateCartQuantityWithMembership(
  lineId: string,
  merchandiseId: string,
  quantity: number,
  customerId?: string
): Promise<MembershipCartActionResult> {
  try {
    if (quantity === 0) {
      // Remove item if quantity is 0
      return await removeFromCartWithMembership(lineId, customerId);
    }

    // Update cart item quantity
    await updateCart([{
      id: lineId,
      merchandiseId,
      quantity
    }]);
    
    // Get updated cart
    const cart = await getCart();
    if (!cart) {
      return { success: false, error: 'Failed to retrieve cart after updating quantity' };
    }

    // Apply membership benefits
    const enhancedCart = await membershipCartMiddleware.applyMembershipBenefits(
      cart,
      customerId
    );

    // Revalidate cart cache
    updateTag(TAGS.cart);

    return {
      success: true,
      cart: enhancedCart,
      membershipStatus: enhancedCart.membershipBenefits?.membershipStatus || 'none'
    };

  } catch (error) {
    console.error('Error updating cart quantity with membership:', error);
    return { 
      success: false, 
      error: 'Failed to update cart quantity' 
    };
  }
}

/**
 * Get cart with membership benefits applied
 * Requirement 4.4: Real-time membership status validation during checkout
 */
export async function getCartWithMembership(
  customerId?: string
): Promise<MembershipCartActionResult> {
  try {
    // Get current cart
    const cart = await getCart();
    if (!cart) {
      return { 
        success: true,
        membershipStatus: 'none'
      };
    }

    // Apply membership benefits
    const enhancedCart = await membershipCartMiddleware.applyMembershipBenefits(
      cart,
      customerId
    );

    return {
      success: true,
      cart: enhancedCart,
      membershipStatus: enhancedCart.membershipBenefits?.membershipStatus || 'none'
    };

  } catch (error) {
    console.error('Error getting cart with membership:', error);
    return { 
      success: false, 
      error: 'Failed to retrieve cart with membership benefits' 
    };
  }
}

/**
 * Validate cart membership status before checkout
 * Requirement 4.4: Real-time membership status validation during checkout
 */
export async function validateCartMembershipStatus(
  customerId: string
): Promise<{
  success: boolean;
  isValid: boolean;
  membershipStatus: 'active' | 'expired' | 'none';
  errors: string[];
  cart?: EnhancedCart;
}> {
  try {
    // Get current cart
    const cart = await getCart();
    if (!cart) {
      return {
        success: true,
        isValid: false,
        membershipStatus: 'none',
        errors: ['No cart found']
      };
    }

    // Validate membership for cart
    const validation = await membershipCartMiddleware.validateCartMembership(cart, customerId);
    
    // Apply membership benefits based on validation
    let enhancedCart: EnhancedCart;
    if (validation.membership && validation.validation.isExpired) {
      // Handle expired membership
      enhancedCart = await membershipCartMiddleware.handleExpiredMembership(
        cart,
        validation.membership
      );
    } else {
      // Apply normal membership benefits
      enhancedCart = await membershipCartMiddleware.applyMembershipBenefits(
        cart,
        customerId,
        validation.membership
      );
    }

    return {
      success: true,
      isValid: validation.isValid,
      membershipStatus: enhancedCart.membershipBenefits?.membershipStatus || 'none',
      errors: validation.errors,
      cart: enhancedCart
    };

  } catch (error) {
    console.error('Error validating cart membership status:', error);
    return {
      success: false,
      isValid: false,
      membershipStatus: 'none',
      errors: ['Failed to validate membership status']
    };
  }
}

/**
 * Refresh membership benefits in cart
 * Used when membership status changes
 */
export async function refreshCartMembershipBenefits(
  customerId: string
): Promise<MembershipCartActionResult> {
  try {
    // Get current cart
    const cart = await getCart();
    if (!cart) {
      return { 
        success: true,
        membershipStatus: 'none'
      };
    }

    // Force refresh membership data
    const membershipResult = await atpMembershipService.getMembership(customerId);
    const membership = membershipResult.success ? membershipResult.data : null;

    // Apply updated membership benefits
    const enhancedCart = await membershipCartMiddleware.applyMembershipBenefits(
      cart,
      customerId,
      membership
    );

    // Revalidate cart cache
    updateTag(TAGS.cart);

    return {
      success: true,
      cart: enhancedCart,
      membershipStatus: enhancedCart.membershipBenefits?.membershipStatus || 'none'
    };

  } catch (error) {
    console.error('Error refreshing cart membership benefits:', error);
    return { 
      success: false, 
      error: 'Failed to refresh membership benefits' 
    };
  }
}

/**
 * Create cart with membership benefits
 */
export async function createCartWithMembership(
  customerId?: string
): Promise<MembershipCartActionResult> {
  try {
    // Create new cart
    const cart = await createCart();
    
    // Apply membership benefits to empty cart (for delivery info)
    const enhancedCart = await membershipCartMiddleware.applyMembershipBenefits(
      cart,
      customerId
    );

    // Revalidate cart cache
    updateTag(TAGS.cart);

    return {
      success: true,
      cart: enhancedCart,
      membershipStatus: enhancedCart.membershipBenefits?.membershipStatus || 'none'
    };

  } catch (error) {
    console.error('Error creating cart with membership:', error);
    return { 
      success: false, 
      error: 'Failed to create cart with membership benefits' 
    };
  }
}

/**
 * Get membership benefits summary for cart
 */
export async function getCartMembershipSummary(
  customerId?: string
): Promise<{
  success: boolean;
  hasDiscounts: boolean;
  hasFreeDelivery: boolean;
  totalSavings: number;
  discountCount: number;
  statusMessage: string;
  membershipStatus: 'active' | 'expired' | 'none';
}> {
  try {
    const result = await getCartWithMembership(customerId);
    
    if (!result.success || !result.cart) {
      return {
        success: true,
        hasDiscounts: false,
        hasFreeDelivery: false,
        totalSavings: 0,
        discountCount: 0,
        statusMessage: 'No cart found',
        membershipStatus: 'none'
      };
    }

    const summary = membershipCartMiddleware.getMembershipBenefitsSummary(result.cart);

    return {
      success: true,
      ...summary,
      membershipStatus: result.membershipStatus || 'none'
    };

  } catch (error) {
    console.error('Error getting cart membership summary:', error);
    return {
      success: false,
      hasDiscounts: false,
      hasFreeDelivery: false,
      totalSavings: 0,
      discountCount: 0,
      statusMessage: 'Failed to load membership benefits',
      membershipStatus: 'none'
    };
  }
}