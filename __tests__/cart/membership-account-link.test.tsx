import React from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
vi.mock('next-intl', () => ({ useLocale: () => 'ar' }))
vi.mock('@/hooks/use-membership', () => ({ useMembership: () => ({ isMember: false, isLoading: false, error: 'unavailable' }) }))
vi.mock('@/components/account/account-shell', () => ({ AccountShell: ({ children }: any) => <div>{children}</div> }))
vi.mock('@/src/i18n/navigation', () => ({ Link: ({ children, ...props }: any) => <a {...props}>{children}</a> }))
import MembershipAccountPage from '@/app/[locale]/account/membership/page'
afterEach(cleanup)
it('keeps membership benefits and purchase accessible when status lookup fails', () => {
 render(<MembershipAccountPage />)
 expect(screen.getByRole('link', { name: 'عرض العضوية والاشتراك' })).toHaveAttribute('href', '/product/atp-membership')
 expect(screen.getByRole('alert')).toHaveTextContent('تعذر التحقق')
})
