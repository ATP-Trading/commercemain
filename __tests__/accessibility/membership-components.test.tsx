import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, beforeEach } from 'vitest';
import { AtpMembershipDashboard } from '../../components/membership/atp-membership-dashboard';
import { MembershipBadge } from '../../components/membership/membership-badge';
import { MemberPricing } from '../../components/membership/member-pricing';
import { TestProviders } from '../__mocks__/test-providers';
import { mockMembership, mockExpiredMembership } from '../__mocks__/membership-data';

expect.extend(toHaveNoViolations);

describe('Membership Components Accessibility Tests', () => {
  beforeEach(() => {
    // Reset any global state
    localStorage.clear();
  });

  describe('AtpMembershipDashboard Accessibility', () => {
    it('should have no accessibility violations for active membership', async () => {
      const { container } = render(
        <TestProviders membership={mockMembership}>
          <AtpMembershipDashboard />
        </TestProviders>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations for expired membership', async () => {
      const { container } = render(
        <TestProviders membership={mockExpiredMembership}>
          <AtpMembershipDashboard />
        </TestProviders>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper status announcements', () => {
      render(
        <TestProviders membership={mockMembership}>
          <AtpMembershipDashboard />
        </TestProviders>
      );

      // Check for status region
      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toBeInTheDocument();
      expect(statusRegion).toHaveAttribute('aria-live', 'polite');

      // Check for membership status announcement
      expect(screen.getByText(/membership is active/i)).toBeInTheDocument();
    });

    it('should have accessible progress indicators', () => {
      render(
        <TestProviders membership={mockMembership}>
          <AtpMembershipDashboard />
        </TestProviders>
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      expect(progressBar).toHaveAttribute('aria-label', expect.stringContaining('membership progress'));
    });
  });

  describe('MembershipBadge Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <TestProviders membership={mockMembership}>
          <MembershipBadge />
        </TestProviders>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper badge semantics', () => {
      render(
        <TestProviders membership={mockMembership}>
          <MembershipBadge />
        </TestProviders>
      );

      const badge = screen.getByRole('img', { name: /atp member/i });
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('aria-label', 'ATP Member - Active');
    });

    it('should indicate status changes', () => {
      const { rerender } = render(
        <TestProviders membership={mockMembership}>
          <MembershipBadge />
        </TestProviders>
      );

      expect(screen.getByRole('img', { name: /active/i })).toBeInTheDocument();

      rerender(
        <TestProviders membership={mockExpiredMembership}>
          <MembershipBadge />
        </TestProviders>
      );

      expect(screen.getByRole('img', { name: /expired/i })).toBeInTheDocument();
    });
  });

  describe('MemberPricing Accessibility', () => {
    const mockProduct = {
      id: 'product_1',
      title: 'Home Massage Service',
      price: 200,
      type: 'service' as const
    };

    it('should have no accessibility violations', async () => {
      const { container } = render(
        <TestProviders membership={mockMembership}>
          <MemberPricing product={mockProduct} />
        </TestProviders>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible price information', () => {
      render(
        <TestProviders membership={mockMembership}>
          <MemberPricing product={mockProduct} />
        </TestProviders>
      );

      // Check for price semantics
      const originalPrice = screen.getByText(/200 AED/i);
      expect(originalPrice).toHaveAttribute('aria-label', 'Original price 200 AED');

      const memberPrice = screen.getByText(/170 AED/i);
      expect(memberPrice).toHaveAttribute('aria-label', 'Member price 170 AED');

      const savings = screen.getByText(/save 30/i);
      expect(savings).toHaveAttribute('aria-label', 'You save 30 د.إ with membership');
    });

    it('should announce price changes', () => {
      const { rerender } = render(
        <TestProviders membership={null}>
          <MemberPricing product={mockProduct} />
        </TestProviders>
      );

      expect(screen.getByText(/200 AED/i)).toBeInTheDocument();
      expect(screen.queryByText(/170 AED/i)).not.toBeInTheDocument();

      rerender(
        <TestProviders membership={mockMembership}>
          <MemberPricing product={mockProduct} />
        </TestProviders>
      );

      // Should announce the discount
      const announcement = screen.getByRole('status');
      expect(announcement).toHaveTextContent(/member discount applied/i);
    });
  });

  describe('RTL Support', () => {
    it('should maintain accessibility in RTL mode', async () => {
      const { container } = render(
        <TestProviders locale="ar">
          <AtpMembershipDashboard />
        </TestProviders>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide meaningful content for screen readers', () => {
      render(
        <TestProviders membership={mockMembership}>
          <AtpMembershipDashboard />
        </TestProviders>
      );

      // Check for screen reader only content
      const srOnlyElements = screen.getAllByText(/screen reader/i, { selector: '.sr-only' });
      expect(srOnlyElements.length).toBeGreaterThan(0);
    });
  });
});
