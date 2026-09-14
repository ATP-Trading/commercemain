import React from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
const state = vi.hoisted(() => ({ locale: 'ar', value: { isMember: false, isLoading: false, error: 'unavailable', membership: {} } as any }))
vi.mock('next-intl', () => ({ useLocale: () => state.locale }))
vi.mock('@/hooks/use-membership', () => ({ useMembership: () => state.value }))
vi.mock('@/components/account/account-shell', () => ({ AccountShell: ({ children }: any) => <div>{children}</div> }))
vi.mock('@/src/i18n/navigation', () => ({ Link: ({ children, ...props }: any) => <a {...props}>{children}</a> }))
import MembershipAccountPage from '@/app/[locale]/account/membership/page'
afterEach(cleanup)
it('keeps membership benefits and purchase accessible when status lookup fails', () => {
 render(<MembershipAccountPage />)
 expect(screen.getByRole('link', { name: 'عرض العضوية والاشتراك' })).toHaveAttribute('href', '/product/atp-membership')
 expect(screen.getByRole('alert')).toHaveTextContent('تعذر التحقق')
})

it('shows real renewal for paid membership in English without offering a second signup', () => {
 state.locale = 'en'
 state.value = {isMember:true,isLoading:false,error:null,membership:{source:'appstle',startedAt:'2026-09-14T13:57:24Z',nextBillingDate:'2027-09-14T13:00:00Z'}}
 render(<MembershipAccountPage />)
 expect(screen.getByText('14 September 2027')).toBeInTheDocument()
 expect(screen.getByText('Manage subscription and renewal')).toBeInTheDocument()
 expect(screen.queryByText('View membership and join')).not.toBeInTheDocument()
})
it('does not show billing or renewal controls for a granted membership', () => {
 state.locale = 'ar'
 state.value = {isMember:true,isLoading:false,error:null,membership:{source:'merchant'}}
 render(<MembershipAccountPage />)
 expect(screen.getByText('عضوية ممنوحة لك من ATP Trading.')).toBeInTheDocument()
 expect(screen.queryByText('موعد التجديد القادم')).not.toBeInTheDocument()
})
