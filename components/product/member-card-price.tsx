'use client'
import { useMembershipDiscount } from '@/hooks/use-storefront-membership-pricing'
import { MemberPrice } from './member-price'

export function MemberCardPrice({ amount, currencyCode, rate, ar }: {
  amount: string; currencyCode: string; rate: number; ar: boolean
}) {
  const { hasActiveMembership, calculateServiceDiscount } = useMembershipDiscount()
  const member = hasActiveMembership && rate > 0
  const finalPrice = member ? calculateServiceDiscount(Number(amount), undefined, rate).finalPrice.toFixed(2) : amount
  return <MemberPrice original={amount} amount={finalPrice} currencyCode={currencyCode} member={member} ar={ar} className="text-lg" />
}
