import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import { DirectionProvider } from '../../components/ui/direction';
import en from '../../messages/en.json';
import ar from '../../messages/ar.json';
import { AtpMembershipSignup } from '../../components/membership/atp-membership-signup';
import { useAtpMembership } from '../../hooks/use-atp-membership';
import { useCustomer } from '../../hooks/use-customer';
import { MembershipError, MembershipErrorCode } from '../../lib/errors/membership-errors';

vi.mock('../../hooks/use-atp-membership', () => ({ useAtpMembership: vi.fn() }));
vi.mock('../../hooks/use-customer', () => ({ useCustomer: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/en/atp-membership'
}));
vi.mock('next/link', () => ({ default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a> }));

const purchase = vi.fn();
function setup(locale: 'en' | 'ar' = 'en', props = {}) {
  const messages = locale === 'ar' ? ar : en;
  const view = render(<NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Dubai">
    <DirectionProvider dir={locale === 'ar' ? 'rtl' : 'ltr'}><AtpMembershipSignup {...props} /></DirectionProvider>
  </NextIntlClientProvider>);
  return { ...view, messages: messages.membership };
}
const signupButton = () => screen.getByRole('button', { name: /Join ATP Membership.*99/ });

beforeEach(() => {
  vi.clearAllMocks();
  purchase.mockReset();
  vi.mocked(useAtpMembership).mockReturnValue({ membership: null, isLoading: false, purchaseMembership: purchase } as any);
  vi.mocked(useCustomer).mockReturnValue({ customer: { id: 'customer-123' } } as any);
  Object.defineProperty(window, 'location', { value: { href: '' }, writable: true });
});

describe('Membership signup', () => {
  it.each(['en', 'ar'] as const)('renders actual %s translations, pricing and savings conditions', (locale) => {
    const { container, messages } = setup(locale);
    expect(screen.getByText(messages.savingsMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.roiMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.benefitsTitle)).toBeInTheDocument();
    expect(screen.getByText(messages.securePayment)).toBeInTheDocument();
    expect(screen.getByText(messages.termsAcceptance)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp(messages.signupTitle + '.*99') })).toBeEnabled();
    expect(container.firstElementChild).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    expect(container.textContent).not.toMatch(/500\+|pays for itself/);
  });

  it('creates checkout for the signed-in customer and redirects', async () => {
    purchase.mockResolvedValue('https://checkout.shopify.com/test');
    setup();
    fireEvent.click(signupButton());
    await waitFor(() => expect(window.location.href).toBe('https://checkout.shopify.com/test'));
    expect(purchase).toHaveBeenCalledExactlyOnceWith('customer-123');
  });

  it('prevents repeated submission while checkout is pending', async () => {
    let finish!: (value: string) => void;
    purchase.mockImplementation(() => new Promise<string>(resolve => { finish = resolve; }));
    setup();
    const button = signupButton();
    fireEvent.click(button);
    expect(button).toBeDisabled();
    expect(screen.getByText(en.membership.processingPayment)).toBeInTheDocument();
    fireEvent.click(button);
    expect(purchase).toHaveBeenCalledTimes(1);
    await act(async () => finish('https://checkout.shopify.com/test'));
  });

  it('shows a checkout failure, notifies the caller and lets the user dismiss it', async () => {
    const error = new MembershipError('Payment failed', MembershipErrorCode.PAYMENT_FAILED);
    const onSignupError = vi.fn();
    purchase.mockRejectedValue(error);
    setup('en', { onSignupError });
    fireEvent.click(signupButton());
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(error.getUserMessage());
    expect(onSignupError).toHaveBeenCalledExactlyOnceWith(error);
    expect(window.location.href).toBe('');
    expect(signupButton()).toBeEnabled();
    fireEvent.click(within(alert).getByRole('button', { name: 'Dismiss error' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('requires login before purchasing', () => {
    vi.mocked(useCustomer).mockReturnValue({ customer: null } as any);
    setup();
    expect(signupButton()).toBeDisabled();
    expect(screen.getByRole('link', { name: en.membership.logIn })).toBeInTheDocument();
    fireEvent.click(signupButton());
    expect(purchase).not.toHaveBeenCalled();
  });

  it('disables purchase while membership status is loading', () => {
    vi.mocked(useAtpMembership).mockReturnValue({ membership: null, isLoading: true, purchaseMembership: purchase } as any);
    setup();
    expect(signupButton()).toBeDisabled();
  });

  it('sends existing members to their dashboard instead of offering another purchase', () => {
    vi.mocked(useAtpMembership).mockReturnValue({ membership: { id: 'mem-123', status: 'active' }, isLoading: false, purchaseMembership: purchase } as any);
    setup();
    expect(screen.getByText(en.membership.alreadyMember)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: en.membership.viewDashboard })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Join ATP Membership.*99/ })).not.toBeInTheDocument();
  });
});
