/**
 * Tests for Membership Cart Middleware
 * 
 * Tests the integration of membership benefits with cart operations
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { membershipCartMiddleware } from '@/lib/cart/membership-cart-middleware';
import { atpMembershipService } from '@/lib/services/atp-membership-service';
import { Cart, CartItem } from '@/lib/shopify/types';
import { AtpMembership } from '@/lib/types/membership';
import { MEMBERSHIP_CONFIG } from '@/lib/constants/membership';

// Mock the membership service
vi.mock('@/lib/services/atp-membership-service', () => ({
  atpMembershipService: {
    getMembership: vi.fn(),
    validateMembership: vi.fn(),
    calculateServiceDiscount: vi.fn(),
    isEligibleForFreeDelivery: vi.fn(),
    isServiceEligibleForDiscount: vi.fn(),
  }
}));

describe('MembershipCartMiddleware', () => {
  let mockCart: Cart;
  let mockMembership: AtpMembership;
  let mockCartItem: CartItem;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock cart item
    mockCartItem = {
      id: 'line-1',
      quantity: 1,
      cost: {
        totalAmount: {
          amount: '100.00',
          currencyCode: 'AED'
        }
      },
      merchandise: {
        id: 'variant-1',
        title: 'Home Massage Service',
        selectedOptions: [],
        product: {
          id: 'product-1',
          handle: 'home-massage-spa',
          title: 'Home Massage & Spa Service',
          featuredImage: {
            url: 'https://example.com/image.jpg',
            altText: 'Massage service',
            width: 300,
            height: 300
          }
        }
      }
    };

    // Mock cart
    mockCart = {
      id: 'cart-1',
      checkoutUrl: 'https://checkout.url',
      totalQuantity: 1,
      lines: [mockCartItem],
      cost: {
        subtotalAmount: {
          amount: '100.00',
          currencyCode: 'AED'
        },
        totalAmount: {
          amount: '100.00',
          currencyCode: 'AED'
        }
      }
    };

    // Mock active membership
    mockMembership = {
      id: 'mem-1',
      customerId: 'customer-1',
      status: 'active',
      startDate: '2024-01-01T00:00:00Z',
      expirationDate: '2025-01-01T00:00:00Z',
      paymentStatus: 'paid',
      benefits: {
        serviceDiscount: 0.15,
        freeDelivery: true,
        eligibleServices: ['massage', 'ems', 'yoga', 'supplements'],
        annualFee: 99
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };
  });

  describe('applyMembershipBenefits', () => {
    it('should apply service discounts for active membership', async () => {
      // Setup mocks
      (atpMembershipService.getMembership as Mock).mockResolvedValue({
        success: true,
        data: mockMembership
      });

      (atpMembershipService.validateMembership as Mock).mockReturnValue({
        isValid: true,
        isActive: true,
        isExpired: false,
        daysUntilExpiration: 300,
        requiresRenewal: false,
        errors: []
      });

      (atpMembershipService.isServiceEligibleForDiscount as Mock).mockReturnValue(true);

      (atpMembershipService.calculateServiceDiscount as Mock).mockReturnValue({
        originalPrice: 100,
        discountAmount: 15,
        discountPercentage: 0.15,
        finalPrice: 85,
        savings: 15
      });

      (atpMembershipService.isEligibleForFreeDelivery as Mock).mockReturnValue(true);

      // Apply benefits
      const result = await membershipCartMiddleware.applyMembershipBenefits(
        mockCart,
        'customer-1'
      );

      // Eligibility must not subtract a second discount or guessed shipping fee.
      expect(result.cost).toEqual(mockCart.cost);
      expect(result.lines).toEqual(mockCart.lines);

      // Verify results
      expect(result.membershipBenefits).toBeDefined();
      expect(result.membershipBenefits?.serviceDiscounts).toHaveLength(1);
      expect(result.membershipBenefits?.freeDelivery).toBe(true);
      expect(result.membershipBenefits?.totalSavings).toBe(15);
      expect(result.membershipBenefits?.membershipStatus).toBe('active');
      expect(result.deliveryInfo?.isFree).toBe(true);
      expect(result.deliveryInfo?.reason).toBe('Member Benefit');
    });

    it('should not apply benefits for expired membership', async () => {
      const expiredMembership = {
        ...mockMembership,
        status: 'expired' as const,
        expirationDate: '2023-01-01T00:00:00Z'
      };

      (atpMembershipService.getMembership as Mock).mockResolvedValue({
        success: true,
        data: expiredMembership
      });

      (atpMembershipService.validateMembership as Mock).mockReturnValue({
        isValid: false,
        isActive: false,
        isExpired: true,
        daysUntilExpiration: 0,
        requiresRenewal: true,
        errors: ['Membership has expired']
      });

      (atpMembershipService.isEligibleForFreeDelivery as Mock).mockReturnValue(false);

      const result = await membershipCartMiddleware.applyMembershipBenefits(
        mockCart,
        'customer-1'
      );

      expect(result.membershipBenefits?.serviceDiscounts).toHaveLength(0);
      expect(result.membershipBenefits?.freeDelivery).toBe(false);
      expect(result.membershipBenefits?.totalSavings).toBe(0);
      expect(result.membershipBenefits?.membershipStatus).toBe('expired');
      expect(result.deliveryInfo?.isFree).toBe(false);
    });

    it('should handle non-eligible services', async () => {
      // Mock non-eligible service
      const nonEligibleItem = {
        ...mockCartItem,
        merchandise: {
          ...mockCartItem.merchandise,
          product: {
            ...mockCartItem.merchandise.product,
            handle: 'non-eligible-product'
          }
        }
      };

      const cartWithNonEligibleItem = {
        ...mockCart,
        lines: [nonEligibleItem]
      };

      (atpMembershipService.getMembership as Mock).mockResolvedValue({
        success: true,
        data: mockMembership
      });

      (atpMembershipService.validateMembership as Mock).mockReturnValue({
        isValid: true,
        isActive: true,
        isExpired: false,
        daysUntilExpiration: 300,
        requiresRenewal: false,
        errors: []
      });

      (atpMembershipService.isServiceEligibleForDiscount as Mock).mockReturnValue(false);
      (atpMembershipService.isEligibleForFreeDelivery as Mock).mockReturnValue(true);

      const result = await membershipCartMiddleware.applyMembershipBenefits(
        cartWithNonEligibleItem,
        'customer-1'
      );

      expect(result.membershipBenefits?.serviceDiscounts).toHaveLength(0);
      expect(result.membershipBenefits?.freeDelivery).toBe(true);
      expect(result.membershipBenefits?.totalSavings).toBe(0);
    });

    it('should handle cart without membership', async () => {
      (atpMembershipService.getMembership as Mock).mockResolvedValue({
        success: true,
        data: null
      });

      (atpMembershipService.validateMembership as Mock).mockReturnValue({
        isValid: false,
        isActive: false,
        isExpired: false,
        daysUntilExpiration: 0,
        requiresRenewal: false,
        errors: ['No membership found']
      });

      const result = await membershipCartMiddleware.applyMembershipBenefits(
        mockCart,
        'customer-1'
      );

      expect(result.membershipBenefits?.serviceDiscounts).toHaveLength(0);
      expect(result.membershipBenefits?.freeDelivery).toBe(false);
      expect(result.membershipBenefits?.totalSavings).toBe(0);
      expect(result.membershipBenefits?.membershipStatus).toBe('none');
      expect(result.deliveryInfo?.isFree).toBe(false);
    });
  });

  describe('validateCartMembership', () => {
    it('should validate active membership', async () => {
      (atpMembershipService.getMembership as Mock).mockResolvedValue({
        success: true,
        data: mockMembership
      });

      (atpMembershipService.validateMembership as Mock).mockReturnValue({
        isValid: true,
        isActive: true,
        isExpired: false,
        daysUntilExpiration: 300,
        requiresRenewal: false,
        errors: []
      });

      const result = await membershipCartMiddleware.validateCartMembership(
        mockCart,
        'customer-1'
      );

      expect(result.isValid).toBe(true);
      expect(result.membership).toEqual(mockMembership);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle expired membership validation', async () => {
      const expiredMembership = {
        ...mockMembership,
        status: 'expired' as const
      };

      (atpMembershipService.getMembership as Mock).mockResolvedValue({
        success: true,
        data: expiredMembership
      });

      (atpMembershipService.validateMembership as Mock).mockReturnValue({
        isValid: false,
        isActive: false,
        isExpired: true,
        daysUntilExpiration: 0,
        requiresRenewal: true,
        errors: ['Membership has expired']
      });

      const result = await membershipCartMiddleware.validateCartMembership(
        mockCart,
        'customer-1'
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Membership has expired. Discounts will not be applied.');
    });
  });

  describe('handleExpiredMembership', () => {
    it('should remove all benefits for expired membership', async () => {
      const expiredMembership = {
        ...mockMembership,
        status: 'expired' as const
      };

      const result = await membershipCartMiddleware.handleExpiredMembership(
        mockCart,
        expiredMembership
      );

      expect(result.membershipBenefits?.serviceDiscounts).toHaveLength(0);
      expect(result.membershipBenefits?.freeDelivery).toBe(false);
      expect(result.membershipBenefits?.totalSavings).toBe(0);
      expect(result.membershipBenefits?.membershipStatus).toBe('expired');
      expect(result.membershipBenefits?.validationErrors).toContain('Membership has expired');
      expect(result.deliveryInfo?.isFree).toBe(false);
      expect(result.deliveryInfo?.reason).toBe('Membership Expired - Standard Delivery');
    });
  });

  describe('getMembershipBenefitsSummary', () => {
    it('should return correct benefits summary', () => {
      const enhancedCart = {
        ...mockCart,
        membershipBenefits: {
          serviceDiscounts: [{
            lineId: 'line-1',
            merchandiseId: 'variant-1',
            productHandle: 'home-massage-spa',
            serviceId: 'massage',
            originalPrice: 100,
            discountAmount: 15,
            discountPercentage: 0.15,
            finalPrice: 85
          }],
          freeDelivery: true,
          totalSavings: 15,
          membershipStatus: 'active' as const,
          validationErrors: []
        }
      };

      const summary = membershipCartMiddleware.getMembershipBenefitsSummary(enhancedCart);

      expect(summary.hasDiscounts).toBe(true);
      expect(summary.hasFreeDelivery).toBe(true);
      expect(summary.totalSavings).toBe(15 + MEMBERSHIP_CONFIG.STANDARD_DELIVERY_COST);
      expect(summary.discountCount).toBe(1);
      expect(summary.statusMessage).toBe('ATP Membership benefits applied');
    });

    it('should handle cart without benefits', () => {
      const summary = membershipCartMiddleware.getMembershipBenefitsSummary(mockCart);

      expect(summary.hasDiscounts).toBe(false);
      expect(summary.hasFreeDelivery).toBe(false);
      expect(summary.totalSavings).toBe(0);
      expect(summary.discountCount).toBe(0);
      expect(summary.statusMessage).toBe('No membership benefits applied');
    });
  });
});