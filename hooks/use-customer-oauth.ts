'use client'

import { useState, useEffect, useCallback } from 'react'

interface Customer {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
}

interface UseCustomerOAuthReturn {
  customer: Customer | null
  isLoading: boolean
  isLoggedIn: boolean
  error: string | null
  login: (returnTo?: string) => void
  logout: (returnTo?: string) => void
  refreshCustomer: () => Promise<void>
}

/**
 * Hook for OAuth-based customer authentication with the new Shopify Customer Accounts
 * 
 * This replaces the legacy password-based authentication with OAuth 2.0 + PKCE
 */
export function useCustomerOAuth(): UseCustomerOAuthReturn {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch customer data from the auth status endpoint
  const fetchCustomer = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/auth/status', {
        credentials: 'include',
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Failed to check authentication status')
      }

      const data = await response.json()

      if (data.error) throw new Error('Unable to load account')

      setIsLoggedIn(data.isLoggedIn)
      setCustomer(data.customer)

      if (data.error) {
        console.warn('[useCustomerOAuth] Warning:', data.error)
      }
    } catch (err) {
      console.error('[useCustomerOAuth] Error fetching customer:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setIsLoggedIn(false)
      setCustomer(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Login - redirects to OAuth flow
  const login = useCallback((returnTo?: string) => {
    const loginUrl = returnTo 
      ? `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`
      : '/api/auth/login'
    
    // Navigate to the login endpoint which will redirect to Shopify
    window.location.href = loginUrl
  }, [])

  // Logout - redirects to logout endpoint
  const logout = useCallback((returnTo?: string) => {
    const logoutUrl = returnTo
      ? `/api/auth/logout?returnTo=${encodeURIComponent(returnTo)}`
      : '/api/auth/logout'
    
    // Navigate to the logout endpoint
    window.location.href = logoutUrl
  }, [])

  // Refresh customer data
  const refreshCustomer = useCallback(async () => {
    await fetchCustomer()
  }, [fetchCustomer])

  // Load customer on mount
  useEffect(() => {
    fetchCustomer()
  }, [fetchCustomer])

  return {
    customer,
    isLoading,
    isLoggedIn,
    error,
    login,
    logout,
    refreshCustomer,
  }
}

/**
 * Type alias for backwards compatibility
 */
export type { Customer as CustomerResponse }
