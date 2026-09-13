/**
 * Membership Cart Middleware
 * 
 * Handles automatic application of membership benefits to cart operations
 * including service discounts and free delivery for active members.
 * 
 * Requirements addressed:
 * - 4.3: Automatically apply member discounts during checkout
 * - 4.4: Real-time membership status validation
 * - 5.1: Automatically set delivery cost to zero for members
 * - 5.2: Display "Free Delivery - Member Benefit" instead of shipping charges
 * - 5.4: Apply standard delivery charges if membership expired
 * - 8.2: Remove discount eligibility when membership expires
 */

import { Cart, CartItem, Money } from '@/lib/shopify/types';
import { AtpMembership, DiscountCalculation, MembershipValidation } from '@/lib/types/membership';
import { atpMembershipService } from '@/lib/services/atp-membership-service';
import { ELIGIBLE_SERVICES, MEMBERSHIP_CONFIG } from '@/lib/constants/membership';
import { UAE_DIRHAM_CODE } from '@/lib/constants';

export interface MembershipCartBenefits {
  serviceDiscounts: CartServiceDiscount[];
  freeDelivery: boolean;
  totalSavings: number;
  membershipStatus: 'active' | 'expired' | 'none';
  validationErrors: string[];
}

export interface CartServiceDiscount {
  lineId: string;
  merchandiseId: string;
  productHandle: string;
  serviceId: string;
  originalPrice: number;
  discountAmount: number;
  discountPercentage: number;
  finalPrice: number;
}

export interface EnhancedCart extends Cart {
  membershipBenefits?: MembershipCartBenefits;
  deliveryInfo?: {
    isFree: boolean;
    reason: string;
    originalCost?: number;
  };
}

export class MembershipCartMiddleware {
  private static instance: MembershipCartMiddleware;
  
  public static getInstance(): MembershipCartMiddleware {
    if (!MembershipCartMiddleware.instance) {
      MembershipCartMiddleware.instance = new MembershipCartMiddleware();
    }
    return MembershipCartMiddleware.instance;
  }

  /**
   * Apply membership benefits to cart
   * Main method that processes cart and applies all applicable benefits
   */
  async applyMembershipBenefits(
    cart: Cart,
    customerId?: string,
    membership?: AtpMembership | null
  ): Promise<EnhancedCart> {
    try {
      // Get membership if not provided
      let activeMembership = membership;
      if (!activeMembership && customerId) {
        const membershipResult = await atpMembershipService.getMembership(customerId);
        activeMembership = membershipResult.success ? membershipResult.data : null;
      }

      // Validate membership status
      const validation = atpMembershipService.validateMembership(activeMembership ?? null);
      
      // Calculate service discounts
      const serviceDiscounts = validation.isValid && validation.isActive
        ? this.calculateServiceDiscounts(cart.lines, activeMembership ?? null)
        : [];
      
      // Determine free delivery eligibility
      const freeDelivery = this.isEligibleForFreeDelivery(activeMembership ?? null, validation);
      
      // Calculate total savings
      const totalSavings = serviceDiscounts.reduce((sum, discount) => sum + discount.discountAmount, 0);
      
      // Create membership benefits summary
      const membershipBenefits: MembershipCartBenefits = {
        serviceDiscounts,
        freeDelivery,
        totalSavings,
        membershipStatus: this.getMembershipStatus(activeMembership ?? null, validation),
        validationErrors: validation.errors
      };

      // Create delivery info
      const deliveryInfo = {
        isFree: freeDelivery,
        reason: freeDelivery ? 'Member Benefit' : 'Standard Delivery',
        originalCost: freeDelivery ? MEMBERSHIP_CONFIG.STANDARD_DELIVERY_COST : undefined
      };

      // Apply discounts to cart totals
      const enhancedCart = this.applyDiscountsToCart(cart, serviceDiscounts, freeDelivery);

      return {
        ...enhancedCart,
        membershipBenefits,
        deliveryInfo
      };

    } catch (error) {
      console.error('Error applying membership benefits to cart:', error);
      
      // Return original cart with error information
      return {
        ...cart,
        membershipBenefits: {
          serviceDiscounts: [],
          freeDelivery: false,
          totalSavings: 0,
          membershipStatus: 'none',
          validationErrors: ['Failed to apply membership benefits']
        }
      };
    }
  }

  /**
   * Calculate service discounts for cart items
   * Requirement 4.3: Automatically apply member discounts during checkout
   */
  private calculateServiceDiscounts(
    cartItems: CartItem[],
    membership: AtpMembership | null
  ): CartServiceDiscount[] {
    if (!membership) return [];

    const discounts: CartServiceDiscount[] = [];

    for (const item of cartItems) {
      const serviceId = this.extractServiceId(item);
      if (!serviceId || !atpMembershipService.isServiceEligibleForDiscount(serviceId)) {
        continue;
      }

      const originalPrice = parseFloat(item.cost.totalAmount.amount);
      const discountCalculation = atpMembershipService.calculateServiceDiscount(
        originalPrice,
        membership,
        serviceId
      );

      if (discountCalculation.discountAmount > 0) {
        discounts.push({
          lineId: item.id || '',
          merchandiseId: item.merchandise.id,
          productHandle: item.merchandise.product.handle,
          serviceId,
          originalPrice: discountCalculation.originalPrice,
          discountAmount: discountCalculation.discountAmount,
          discountPercentage: discountCalculation.discountPercentage,
          finalPrice: discountCalculation.finalPrice
        });
      }
    }

    return discounts;
  }

  /**
   * Check if customer is eligible for free delivery
   * Requirements 5.1, 5.2: Free delivery for active members
   */
  private isEligibleForFreeDelivery(
    membership: AtpMembership | null,
    validation: MembershipValidation
  ): boolean {
    if (!membership || !validation.isValid || !validation.isActive) {
      return false;
    }

    return atpMembershipService.isEligibleForFreeDelivery(membership);
  }

  /**
   * Get membership status for cart display
   */
  private getMembershipStatus(
    membership: AtpMembership | null,
    validation: MembershipValidation
  ): 'active' | 'expired' | 'none' {
    if (!membership) return 'none';
    if (validation.isExpired) return 'expired';
    if (validation.isActive) return 'active';
    return 'none';
  }

  /**
   * Apply calculated discounts to cart totals
   */
  private applyDiscountsToCart(
    cart: Cart,
    serviceDiscounts: CartServiceDiscount[],
    freeDelivery: boolean
  ): Cart {
    // Eligibility estimates must never overwrite Shopify's payable amounts.
    // Shopify applies discounts and delivery rules at cart/checkout level.
    return cart;
  }

  /**
   * Extract service ID from cart item
   * Maps product handles to service IDs for discount eligibility
   */
  private extractServiceId(item: CartItem): string | null {
    const productHandle = item.merchandise.product.handle;
    
    // Map product handles to service IDs
    const serviceMapping: Record<string, string> = {
      'home-massage-spa': 'massage',
      'ems-training': 'ems',
      'home-yoga': 'yoga',
      'cosmetics-supplements': 'supplements',
      'massage-therapy': 'massage',
      'spa-services': 'massage',
      'personal-training': 'ems',
      'fitness-training': 'ems',
      'yoga-sessions': 'yoga',
      'wellness-yoga': 'yoga',
      'health-supplements': 'supplements',
      'beauty-cosmetics': 'supplements'
    };

    return serviceMapping[productHandle] || null;
  }

  /**
   * Validate cart for membership benefits
   * Requirement 4.4: Real-time membership status validation during checkout
   */
  async validateCartMembership(
    cart: Cart,
    customerId: string
  ): Promise<{
    isValid: boolean;
    membership: AtpMembership | null;
    validation: MembershipValidation;
    errors: string[];
  }> {
    try {
      // Get current membership
      const membershipResult = await atpMembershipService.getMembership(customerId);
      const membership = membershipResult.success ? membershipResult.data : null;

      // Validate membership
      const validation = atpMembershipService.validateMembership(membership);

      // Check for specific cart-related validation issues
      const errors: string[] = [...validation.errors];

      // Additional cart-specific validations
      if (membership && validation.isExpired) {
        errors.push('Membership has expired. Discounts will not be applied.');
      }

      if (membership && !validation.isActive && membership.paymentStatus !== 'paid') {
        errors.push('Membership payment is pending. Benefits will be applied after payment confirmation.');
      }

      return {
        isValid: validation.isValid,
        membership,
        validation,
        errors
      };

    } catch (error) {
      console.error('Error validating cart membership:', error);
      return {
        isValid: false,
        membership: null,
        validation: {
          isValid: false,
          isActive: false,
          isExpired: false,
          daysUntilExpiration: 0,
          requiresRenewal: false,
          errors: ['Failed to validate membership']
        },
        errors: ['Failed to validate membership status']
      };
    }
  }

  /**
   * Handle expired membership scenarios in cart
   * Requirement 8.2: Remove discount eligibility when membership expires
   */
  async handleExpiredMembership(
    cart: Cart,
    expiredMembership: AtpMembership
  ): Promise<EnhancedCart> {
    // Remove all membership benefits
    const membershipBenefits: MembershipCartBenefits = {
      serviceDiscounts: [],
      freeDelivery: false,
      totalSavings: 0,
      membershipStatus: 'expired',
      validationErrors: [
        'Membership has expired',
        'Service discounts are no longer available',
        'Standard delivery charges apply'
      ]
    };

    const deliveryInfo = {
      isFree: false,
      reason: 'Membership Expired - Standard Delivery',
      originalCost: undefined
    };

    return {
      ...cart,
      membershipBenefits,
      deliveryInfo
    };
  }

  /**
   * Get membership benefits summary for cart display
   */
  getMembershipBenefitsSummary(enhancedCart: EnhancedCart): {
    hasDiscounts: boolean;
    hasFreeDelivery: boolean;
    totalSavings: number;
    discountCount: number;
    statusMessage: string;
  } {
    const benefits = enhancedCart.membershipBenefits;
    
    if (!benefits) {
      return {
        hasDiscounts: false,
        hasFreeDelivery: false,
        totalSavings: 0,
        discountCount: 0,
        statusMessage: 'No membership benefits applied'
      };
    }

    const deliverySavings = benefits.freeDelivery ? MEMBERSHIP_CONFIG.STANDARD_DELIVERY_COST : 0;
    const totalSavings = benefits.totalSavings + deliverySavings;

    let statusMessage = '';
    if (benefits.membershipStatus === 'active') {
      statusMessage = 'ATP Membership benefits applied';
    } else if (benefits.membershipStatus === 'expired') {
      statusMessage = 'Membership expired - benefits not available';
    } else {
      statusMessage = 'No active membership';
    }

    return {
      hasDiscounts: benefits.serviceDiscounts.length > 0,
      hasFreeDelivery: benefits.freeDelivery,
      totalSavings,
      discountCount: benefits.serviceDiscounts.length,
      statusMessage
    };
  }
}

// Export singleton instance
export const membershipCartMiddleware = MembershipCartMiddleware.getInstance();