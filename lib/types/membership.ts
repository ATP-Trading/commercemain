/**
 * ATP Membership System Types and Interfaces
 * 
 * Core TypeScript interfaces for the ATP Group Services Membership system
 * that provides 99 د.إ annual membership with 15% service discounts and free delivery.
 */

// Core membership interface
export interface AtpMembership {
  id: string;
  customerId: string;
  status: MembershipStatus;
  startDate: string;
  expirationDate: string;
  subscriptionId?: string;
  paymentStatus: PaymentStatus;
  benefits: MembershipBenefits;
  createdAt: string;
  updatedAt: string;
}

// Membership status enumeration
export type MembershipStatus = 'active' | 'expired' | 'cancelled' | 'pending';

// Payment status enumeration
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';

// Membership benefits interface
export interface MembershipBenefits {
  serviceDiscount: number; // 15% = 0.15
  freeDelivery: boolean;
  eligibleServices: string[];
  annualFee: number; // 99 AED
}

// Membership statistics interface
export interface MembershipStats {
  totalSavings: number;
  servicesUsed: number;
  ordersWithFreeDelivery: number;
  memberSince: string;
  lastServiceDate?: string;
  averageOrderValue: number;
  totalOrders: number;
}

// Membership creation payload
export interface CreateMembershipPayload {
  customerId: string;
  paymentMethodId?: string;
  subscriptionId?: string;
}

// Membership renewal payload
export interface RenewMembershipPayload {
  membershipId: string;
  paymentMethodId?: string;
  extendFromCurrentExpiration?: boolean;
}

// Membership update payload
export interface UpdateMembershipPayload {
  status?: MembershipStatus;
  paymentStatus?: PaymentStatus;
  expirationDate?: string;
  subscriptionId?: string;
}

// Error handling types and enums
export enum MembershipErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CUSTOMER = 'INVALID_CUSTOMER',
  CUSTOMER_NOT_FOUND = 'CUSTOMER_NOT_FOUND',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Membership Status
  MEMBERSHIP_NOT_FOUND = 'MEMBERSHIP_NOT_FOUND',
  MEMBERSHIP_EXPIRED = 'MEMBERSHIP_EXPIRED',
  MEMBERSHIP_ALREADY_EXISTS = 'MEMBERSHIP_ALREADY_EXISTS',
  MEMBERSHIP_CANCELLED = 'MEMBERSHIP_CANCELLED',
  INVALID_MEMBERSHIP_DATA = 'INVALID_MEMBERSHIP_DATA',
  
  // Payment & Billing
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
  INVALID_PAYMENT_METHOD = 'INVALID_PAYMENT_METHOD',
  SUBSCRIPTION_FAILED = 'SUBSCRIPTION_FAILED',
  
  // API & Integration
  SHOPIFY_API_ERROR = 'SHOPIFY_API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // Discount & Benefits
  DISCOUNT_APPLICATION_FAILED = 'DISCOUNT_APPLICATION_FAILED',
  INVALID_DISCOUNT_CODE = 'INVALID_DISCOUNT_CODE',
  BENEFIT_NOT_AVAILABLE = 'BENEFIT_NOT_AVAILABLE',
  
  // Validation
  INVALID_INPUT = 'INVALID_INPUT',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  REQUIRED_FIELD_MISSING = 'REQUIRED_FIELD_MISSING',
  
  // Operations
  RENEWAL_FAILED = 'RENEWAL_FAILED',
  CANCELLATION_FAILED = 'CANCELLATION_FAILED',
  
  // System
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface MembershipErrorDetails {
  field?: string;
  value?: unknown;
  expected?: unknown;
  context?: Record<string, unknown>;
  timestamp?: string;
  requestId?: string;
}

export class MembershipError extends Error {
  public readonly code: MembershipErrorCode;
  public readonly details: MembershipErrorDetails;
  public readonly isRetryable: boolean;
  public readonly statusCode: number;

  constructor(
    message: string,
    code: MembershipErrorCode,
    details: MembershipErrorDetails = {},
    isRetryable: boolean = false,
    statusCode: number = 400
  ) {
    super(message);
    this.name = 'MembershipError';
    this.code = code;
    this.details = {
      ...details,
      timestamp: new Date().toISOString(),
      requestId: details.requestId || this.generateRequestId()
    };
    this.isRetryable = isRetryable;
    this.statusCode = statusCode;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MembershipError);
    }
  }

  generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      isRetryable: this.isRetryable,
      statusCode: this.statusCode,
      stack: this.stack
    };
  }

  getUserMessage(): string {
    switch (this.code) {
      case MembershipErrorCode.MEMBERSHIP_NOT_FOUND:
        return 'No active membership found. Please purchase a membership to access benefits.';
      case MembershipErrorCode.MEMBERSHIP_EXPIRED:
        return 'Your membership has expired. Please renew to continue enjoying benefits.';
      case MembershipErrorCode.PAYMENT_FAILED:
        return 'Payment processing failed. Please check your payment method and try again.';
      case MembershipErrorCode.NETWORK_ERROR:
        return 'Connection error. Please check your internet connection and try again.';
      case MembershipErrorCode.SERVICE_UNAVAILABLE:
        return 'Service temporarily unavailable. Please try again later.';
      case MembershipErrorCode.DISCOUNT_APPLICATION_FAILED:
        return 'Unable to apply membership discount. Please contact support if this continues.';
      case MembershipErrorCode.VALIDATION_FAILED:
      case MembershipErrorCode.VALIDATION_ERROR:
        return 'Please check your information and try again.';
      default:
        return 'An unexpected error occurred. Please try again or contact support.';
    }
  }

  shouldRetry(): boolean {
    return this.isRetryable && [
      MembershipErrorCode.NETWORK_ERROR,
      MembershipErrorCode.SERVICE_UNAVAILABLE,
      MembershipErrorCode.RATE_LIMIT_EXCEEDED
    ].includes(this.code);
  }
}

// Error response interface
export interface MembershipErrorResponse {
  error: {
    code: MembershipErrorCode;
    message: string;
    details?: unknown;
  };
  timestamp: string;
  requestId?: string;
}

// API response wrapper types
export interface MembershipApiResponse<T> {
  data?: T;
  error?: MembershipErrorResponse['error'];
  success: boolean;
  timestamp: string;
}

// Service operation result type
export type MembershipResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: MembershipError;
};

// Discount calculation types
export interface DiscountCalculation {
  originalPrice: number;
  discountAmount: number;
  discountPercentage: number;
  finalPrice: number;
  savings: number;
}

export interface ServiceDiscountInfo {
  serviceId: string;
  serviceName: string;
  isEligible: boolean;
  discountPercentage: number;
  originalPrice: number;
  discountedPrice: number;
}

// Eligible services enumeration
export enum EligibleService {
  HOME_MASSAGE_SPA = 'home-massage-spa',
  EMS_TRAINING = 'ems-training',
  HOME_YOGA = 'home-yoga',
  COSMETICS_SUPPLEMENTS = 'cosmetics-supplements'
}

// Membership validation result
export interface MembershipValidation {
  isValid: boolean;
  isActive: boolean;
  isExpired: boolean;
  daysUntilExpiration: number;
  requiresRenewal: boolean;
  errors: string[];
}

// Membership notification types
export interface MembershipNotification {
  type: 'renewal_reminder' | 'expiration_warning' | 'expired' | 'renewed' | 'cancelled';
  membershipId: string;
  customerId: string;
  message: string;
  actionRequired: boolean;
  expirationDate?: string;
  renewalUrl?: string;
}

// Analytics and reporting types
export interface MembershipAnalytics {
  totalMemberships: number;
  activeMemberships: number;
  expiredMemberships: number;
  cancelledMemberships: number;
  newMembershipsThisMonth: number;
  renewalRate: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageRevenuePerMember: number;
  expiringThisMonth: number;
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  cancelledMembers: number;
  averageLifetimeValue: number;
  churnRate: number;
  memberSavings: number;
}

export interface MembershipReportData {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  analytics: MembershipAnalytics;
  topServices: Array<{
    serviceId: string;
    serviceName: string;
    usageCount: number;
    totalSavings: number;
  }>;
}

// Membership signup data interface
export interface MembershipSignupData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptTerms: boolean;
  paymentMethodId?: string;
}

// Membership renewal data interface
export interface MembershipRenewalData {
  membershipId: string;
  customerId: string;
  paymentMethodId?: string;
  extendFromCurrentExpiration?: boolean;
}