"use client"

import { useState, useEffect } from "react"
import { useCustomerOAuth } from "./use-customer-oauth"

export type MembershipTier = "essential" | "premium" | "elite" | "atp" | null

interface MembershipData {
  tier: MembershipTier
  isActive: boolean
  source?: "appstle" | "merchant"
  startedAt?: string
  nextBillingDate?: string
  expiresAt?: string
  discountRate: number
}

// Membership hook integrated with Shopify Customer Account API (OAuth)
export function useMembership() {
  const { customer, isLoading: customerLoading, isLoggedIn } = useCustomerOAuth()
  const [membership, setMembership] = useState<MembershipData>({
    tier: null,
    isActive: false,
    discountRate: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const resetMembership = () => {
      setMembership({
        tier: null,
        isActive: false,
        discountRate: 0,
      })
    }

    const loadMembership = async () => {
      if (customerLoading) {
        setIsLoading(true)
        return
      }

      if (!isLoggedIn || !customer?.id) {
        resetMembership()
        setError(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          '/api/membership/status',
          {
            credentials: 'include',
            cache: 'no-store',
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch membership status')
        }

        const data = await response.json()

        if (cancelled) return

        if (data.isMember && data.membership) {
          setMembership({
            tier: data.tier,
            source: data.membership.source,
            isActive: true,
            expiresAt: data.membership.expirationDate,
            startedAt: data.membership.startedAt,
            nextBillingDate: data.membership.nextBillingDate,
            discountRate: typeof data.discountRate === 'number' ? data.discountRate : 0,
          })
        } else {
          resetMembership()
        }
      } catch (error) {
        console.warn('[useMembership] Failed to load membership status:', error)
        if (!cancelled) {
          setError("membership-unavailable")
          resetMembership()
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadMembership()

    return () => {
      cancelled = true
    }
  }, [customer?.id, customerLoading, isLoggedIn])

  const applyMemberDiscount = (price: number): number => {
    if (!membership.isActive || !membership.tier) return price
    return price * (1 - membership.discountRate)
  }

  const getMemberPrice = (
    originalPrice: string,
  ): {
    originalPrice: number
    memberPrice: number
    savings: number
  } => {
    const price = Number.parseFloat(originalPrice)
    const memberPrice = applyMemberDiscount(price)
    return {
      originalPrice: price,
      memberPrice,
      savings: price - memberPrice,
    }
  }

  return {
    membership,
    isLoading,
    error,
    applyMemberDiscount,
    getMemberPrice,
    isMember: membership.isActive && membership.tier !== null,
  }
}
