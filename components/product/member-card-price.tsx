'use client'
import { useMembershipDiscount } from '@/hooks/use-storefront-membership-pricing'
import { MemberPrice } from './member-price'

export function MemberCardPrice({ amount, currencyCode, rate, ar, staffEligible = true }: {
  amount: string; currencyCode: string; rate: number; ar: boolean; staffEligible?: boolean
}) {
  const { hasActiveMembership, hasStaffDiscount, calculateServiceDiscount } = useMembershipDiscount()
  const staff = hasStaffDiscount && staffEligible
  const member = staff || (hasActiveMembership && rate > 0)
  const finalPrice = member ? calculateServiceDiscount(Number(amount), undefined, rate).finalPrice.toFixed(2) : amount
  return <MemberPrice original={amount} amount={finalPrice} currencyCode={currencyCode} member={member} staff={staff} ar={ar} className="text-lg" />
}
