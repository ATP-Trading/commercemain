import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
const entitlement = vi.hoisted(() => ({ staffDiscountRate: 0, isMember: false, isLoading: false, membership: { discountRate: 0.15 } }))
vi.mock('@/hooks/use-membership', () => ({ useMembership: () => entitlement }))
vi.mock('@/components/price', () => ({ default: ({ amount }: { amount: string }) => <span>{amount}</span> }))
import { MemberCardPrice } from '@/components/product/member-card-price'
beforeEach(() => { entitlement.staffDiscountRate = 0; entitlement.isMember = false })
afterEach(cleanup)
it.each([false, true])('shows staff savings and English label in Arabic=%s', ar => {
  entitlement.staffDiscountRate = 0.2
  const { container } = render(<MemberCardPrice amount="180.00" currencyCode="AED" rate={0.15} ar={ar} />)
  expect(container.querySelector('del')).toHaveTextContent('180.00')
  expect(screen.getByText('144.00')).toBeInTheDocument()
  expect(screen.getByText('Staff discount')).toBeInTheDocument()
  expect(screen.queryByText('Member price')).not.toBeInTheDocument()
})
it('does not stack membership and staff discounts', () => {
  entitlement.staffDiscountRate = 0.2; entitlement.isMember = true
  render(<MemberCardPrice amount="100" currencyCode="AED" rate={0.15} ar={false} />)
  expect(screen.getByText('80.00')).toBeInTheDocument()
})
it('keeps normal member pricing', () => {
  entitlement.isMember = true
  render(<MemberCardPrice amount="100" currencyCode="AED" rate={0.15} ar={false} />)
  expect(screen.getByText('85.00')).toBeInTheDocument()
  expect(screen.getByText('Member price')).toBeInTheDocument()
})
it('does not show staff pricing to guests or on membership subscriptions', () => {
  const { rerender, container } = render(<MemberCardPrice amount="100" currencyCode="AED" rate={0.15} ar={false} />)
  expect(container.querySelector('del')).toBeNull()
  entitlement.staffDiscountRate = 0.2
  rerender(<MemberCardPrice amount="100" currencyCode="AED" rate={0} ar={false} staffEligible={false} />)
  expect(container.querySelector('del')).toBeNull()
  expect(screen.queryByText('Staff discount')).not.toBeInTheDocument()
})
