import type { ReactNode } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MembershipBadge } from '@/components/membership/membership-badge';
import { MemberPricing } from '@/components/membership/member-pricing';
import { TestProviders } from '../__mocks__/test-providers';
import en from '@/messages/en.json';
import ar from '@/messages/ar.json';

expect.extend(toHaveNoViolations);

// Mock only the resolved membership/network and Next router boundaries.
// Pricing calculations, components, currency icons, next-intl and axe are real.
const state = vi.hoisted(() => ({ isMember: false, isLoading: false, discountRate: 0.15, pathname: '/en' }));
vi.mock('@/hooks/use-membership', () => ({ useMembership: () => ({
  membership: { tier: state.isMember ? 'atp' : null, isActive: state.isMember, discountRate: state.discountRate },
  isMember: state.isMember, isLoading: state.isLoading, error: null,
}) }));
vi.mock('next/navigation', () => ({
  usePathname: () => state.pathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

let oldDir: string | null;
let oldLang: string | null;
let oldBodyClass: string;
beforeEach(() => {
  state.isMember = false; state.isLoading = false; state.discountRate = 0.15;
  oldDir = document.documentElement.getAttribute('dir');
  oldLang = document.documentElement.getAttribute('lang');
  oldBodyClass = document.body.className;
});
afterEach(() => {
  cleanup();
  for (const [key, value] of [['dir', oldDir], ['lang', oldLang]] as const) {
    if (value === null) document.documentElement.removeAttribute(key);
    else document.documentElement.setAttribute(key, value);
  }
  document.body.className = oldBodyClass;
  document.cookie = 'atp-locale=; Max-Age=0; path=/';
  vi.restoreAllMocks();
});

for (const locale of ['en', 'ar'] as const) {
  describe(`${locale} current membership badge and pricing`, () => {
    const messages = locale === 'ar' ? ar : en;
    const name = locale === 'ar' ? 'عضوية ATP' : 'ATP Membership';
    const amount = (value: number) => new Intl.NumberFormat(`${locale}-AE`, {
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(value);
    const view = (child: ReactNode) => {
      state.pathname = `/${locale}`;
      return <TestProviders locale={locale}>{child}</TestProviders>;
    };

    it('renders a non-empty translated badge with no detected axe violations', async () => {
      const { container } = render(view(<MembershipBadge tier="atp" discount={15} />));
      expect(screen.getByText(new RegExp(name))).toBeVisible();
      expect(container.querySelector('.membership-badge')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
      expect(container.textContent).toContain(locale === 'ar' ? 'خصم 15٪' : '15% OFF');
      expect(await axe(container)).toHaveNoViolations();
    });

    it('does not invent a membership badge without an explicit tier', () => {
      const { container, rerender } = render(view(<MembershipBadge tier="atp" />));
      expect(screen.getByText(name)).toBeVisible();
      rerender(view(<MembershipBadge tier={null} />));
      expect(container.querySelector('.membership-badge')).toBeNull();
      expect(screen.queryByText(name)).not.toBeInTheDocument();
    });

    it('shows only the regular price to a non-member, without free delivery', async () => {
      const { container } = render(view(<MemberPricing originalPrice="200" showFreeDelivery />));
      expect(screen.getByText(amount(200))).toBeVisible();
      expect(screen.queryByText(amount(170))).not.toBeInTheDocument();
      expect(screen.queryByText(messages.membership.youSave)).not.toBeInTheDocument();
      expect(screen.queryByText(messages.membership.freeDeliveryBenefit)).not.toBeInTheDocument();
      expect(container.querySelector('svg[aria-label="UAE Dirham Symbol"]')).not.toBeNull();
      expect(await axe(container)).toHaveNoViolations();
    });

    it('renders the actual member calculation and localized savings without axe violations', async () => {
      state.isMember = true;
      const { container } = render(view(<MemberPricing originalPrice="200" showFreeDelivery />));
      expect(screen.getByText(amount(200))).toBeVisible();
      expect(screen.getByText(amount(170))).toBeVisible();
      expect(screen.getByText(amount(30))).toBeVisible();
      expect(screen.getByText(messages.membership.youSave)).toBeVisible();
      expect(screen.getByText(messages.membership.freeDeliveryBenefit)).toBeVisible();
      expect(screen.getByText(amount(200)).closest('.line-through')).not.toBeNull();
      expect(container.querySelector('[dir]')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
      expect(await axe(container)).toHaveNoViolations();
    });

    it('removes the member price and benefits when resolved membership is revoked', () => {
      state.isMember = true;
      const { rerender } = render(view(<MemberPricing originalPrice="200" showFreeDelivery />));
      expect(screen.getByText(amount(170))).toBeVisible();
      state.isMember = false;
      rerender(view(<MemberPricing originalPrice="200" showFreeDelivery />));
      expect(screen.getByText(amount(200))).toBeVisible();
      expect(screen.queryByText(amount(170))).not.toBeInTheDocument();
      expect(screen.queryByText(messages.membership.youSave)).not.toBeInTheDocument();
      expect(screen.queryByText(messages.membership.freeDeliveryBenefit)).not.toBeInTheDocument();
    });

    it('does not apply the offer while the status boundary resolves a non-member', () => {
      state.isLoading = true;
      render(view(<MemberPricing originalPrice="200" showFreeDelivery />));
      expect(screen.getByText(amount(200))).toBeVisible();
      expect(screen.queryByText(amount(170))).not.toBeInTheDocument();
      expect(screen.queryByText(messages.membership.freeDeliveryBenefit)).not.toBeInTheDocument();
    });

    it('uses a product discount override in the real pricing hook without changing the default', () => {
      state.isMember = true;
      const { rerender } = render(view(<MemberPricing originalPrice="200" discountRate={0.1} />));
      expect(screen.getByText(amount(180))).toBeVisible();
      expect(screen.getByText(amount(20))).toBeVisible();
      expect(screen.queryByText(amount(170))).not.toBeInTheDocument();
      rerender(view(<MemberPricing originalPrice="200" />));
      expect(screen.getByText(amount(170))).toBeVisible();
      expect(state.discountRate).toBe(0.15);
    });

    it('does not display a free-delivery claim unless explicitly requested', () => {
      state.isMember = true;
      render(view(<MemberPricing originalPrice="200" />));
      expect(screen.getByText(amount(170))).toBeVisible();
      expect(screen.queryByText(messages.membership.freeDeliveryBenefit)).not.toBeInTheDocument();
    });
  });
}
