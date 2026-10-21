import { OPTIONAL_TRACKING_ENABLED } from '@/lib/analytics/tracking-policy';
/**
 * Cart Customer Utilities
 * 
 * Utilities for detecting customer authentication and integrating
 * customer context with cart operations for membership benefits.
 */

'use client';

import { useEffect, useState } from 'react';

// Customer context interface
export interface CartCustomerContext {
  customerId?: string;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Hook to get customer context for cart operations
 * This would typically integrate with your authentication system
 */
export function useCartCustomerContext(): CartCustomerContext {
  const [customerContext, setCustomerContext] = useState<CartCustomerContext>({
    customerId: undefined,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // TODO: Replace with actual authentication check
    // This is a placeholder implementation
    const checkCustomerAuth = async () => {
      try {
        // Check for customer session/token
        const customerId = getCustomerIdFromStorage();
        
        if (customerId) {
          setCustomerContext({
            customerId,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          setCustomerContext({
            customerId: undefined,
            isAuthenticated: false,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Error checking customer authentication:', error);
        setCustomerContext({
          customerId: undefined,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    checkCustomerAuth();
  }, []);

  return customerContext;
}

/**
 * Get customer ID from local storage or session
 * This is a placeholder - replace with your actual auth implementation
 */
function getCustomerIdFromStorage(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  
  try {
    // Check localStorage for customer session
    const customerData = localStorage.getItem('customer_session');
    if (customerData) {
      const parsed = JSON.parse(customerData);
      return parsed.customerId;
    }
    
    // Check sessionStorage as fallback
    const sessionData = sessionStorage.getItem('customer_id');
    return sessionData || undefined;
  } catch (error) {
    console.error('Error reading customer data from storage:', error);
    return undefined;
  }
}

/**
 * Set customer ID in storage
 * Call this when customer logs in
 */
export function setCustomerIdInStorage(customerId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const customerData = {
      customerId,
      timestamp: Date.now()
    };
    
    localStorage.setItem('customer_session', JSON.stringify(customerData));
    sessionStorage.setItem('customer_id', customerId);
  } catch (error) {
    console.error('Error storing customer data:', error);
  }
}

/**
 * Clear customer ID from storage
 * Call this when customer logs out
 */
export function clearCustomerIdFromStorage(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('customer_session');
    sessionStorage.removeItem('customer_id');
  } catch (error) {
    console.error('Error clearing customer data:', error);
  }
}

/**
 * Check if customer has active session
 */
export function hasActiveCustomerSession(): boolean {
  return !!getCustomerIdFromStorage();
}

/**
 * Get customer ID for cart operations
 * Returns undefined if not authenticated
 */
export function getCartCustomerId(): string | undefined {
  return getCustomerIdFromStorage();
}

/**
 * Higher-order component to provide customer context to cart components
 */
export function withCartCustomerContext<P extends object>(
  Component: React.ComponentType<P & { customerId?: string }>
) {
  return function CartCustomerContextWrapper(props: P) {
    const { customerId } = useCartCustomerContext();
    
    return <Component {...props} customerId={customerId} />;
  };
}

/**
 * Utility to validate customer ID format
 */
export function isValidCustomerId(customerId: string | undefined): boolean {
  if (!customerId) return false;
  
  // Basic validation - adjust based on your customer ID format
  return customerId.length > 0 && /^[a-zA-Z0-9_-]+$/.test(customerId);
}

/**
 * Get customer context for server-side operations
 * This would typically check cookies or headers
 */
export function getServerSideCustomerId(request?: Request): string | undefined {
  if (!request) return undefined;
  
  try {
    // Check for customer ID in cookies
    const cookies = request.headers.get('cookie');
    if (cookies) {
      const customerMatch = cookies.match(/customer_id=([^;]+)/);
      if (customerMatch) {
        return customerMatch[1];
      }
    }
    
    // Check for customer ID in authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Customer ')) {
      return authHeader.substring(9);
    }
    
    return undefined;
  } catch (error) {
    console.error('Error getting server-side customer ID:', error);
    return undefined;
  }
}

/**
 * Cart event tracking with customer context
 */
export function trackCartEventWithCustomer(
  event: 'add_to_cart' | 'remove_from_cart' | 'update_quantity' | 'view_cart' | 'checkout',
  data: {
    productId?: string;
    variantId?: string;
    quantity?: number;
    value?: number;
  }
): void {
  const customerId = getCartCustomerId();
  const isAuthenticated = !!customerId;
  
  // Track event with customer context
  if (OPTIONAL_TRACKING_ENABLED && typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, {
      ...data,
      customer_id: customerId,
      is_authenticated: isAuthenticated,
      event_category: 'cart',
      event_label: isAuthenticated ? 'authenticated' : 'anonymous'
    });
  }
  
  console.log('Cart event tracked:', {
    event,
    ...data,
    customerId: customerId ? 'present' : 'none',
    isAuthenticated
  });
}