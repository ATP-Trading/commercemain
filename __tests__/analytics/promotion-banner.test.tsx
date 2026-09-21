import React from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
vi.mock('next-intl', () => ({useLocale: () => 'en'}))
vi.mock('@/src/i18n/navigation', () => ({Link: ({children, ...props}: React.ComponentProps<"a">) => <a {...props}>{children}</a>}))
import { PromotionBanner } from '@/components/layout/promotion-banner'
afterEach(() => { cleanup(); vi.useRealTimers() })
it('hides at the deadline without requiring a refresh', () => {
 vi.useFakeTimers(); vi.setSystemTime(new Date('2026-09-21T19:44:59Z'))
 render(<PromotionBanner expiresAt="2026-09-21T23:45:00+04:00" deadlineLabelAr="" deadlineLabelEn="Ends Monday" />)
 expect(screen.getByRole('complementary')).toBeInTheDocument()
 act(() => vi.advanceTimersByTime(1000))
 expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
})
it('does not show an expired offer on initial load', () => {
 vi.useFakeTimers(); vi.setSystemTime(new Date('2026-09-22T00:00:00Z'))
 render(<PromotionBanner expiresAt="2026-09-21T23:45:00+04:00" deadlineLabelAr="" deadlineLabelEn="Ends Monday" />)
 expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
})
