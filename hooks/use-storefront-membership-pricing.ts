'use client'
import { useMembership } from './use-membership'
/** Display estimates only: Shopify remains authoritative for checkout totals. */
export function useMembershipDiscount() {
 const { membership, isMember, isLoading } = useMembership()
 return {
  membership, isLoading, hasActiveMembership: isMember,
  checkFreeDeliveryEligibility: () => isMember,
  calculateServiceDiscount: (price: number, _serviceId?: string) => {
   const discountPercentage = isMember ? membership.discountRate : 0
   const finalPrice = Math.round(price * (1 - discountPercentage) * 100) / 100
   return { originalPrice: price, finalPrice, savings: price - finalPrice, discountAmount: price - finalPrice, discountPercentage }
  }
 }
}
