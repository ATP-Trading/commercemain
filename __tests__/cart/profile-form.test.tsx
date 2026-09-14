import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
vi.mock('next-intl', () => ({ useLocale: () => 'ar' }));
vi.mock('@/hooks/use-customer-oauth', () => ({ useCustomerOAuth: () => ({ customer: { id: '1', firstName: null, lastName: null, email: 'test@example.com' }, isLoading: false, isLoggedIn: true, error: null }) }));
vi.mock('@/src/i18n/navigation', () => ({ Link: ({ children, href }: any) => <a href={href}>{children}</a> }));
import { ProfileForm } from '@/components/account/profile-form';
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
describe('Profile form', () => {
  it('saves a newly entered Arabic name and shows confirmation', async () => {
    const save = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, customer: { firstName: 'سعود', lastName: '' } })));
    vi.stubGlobal('fetch', save);
    render(<ProfileForm />);
    fireEvent.change(screen.getByLabelText('الاسم الأول'), { target: { value: 'سعود' } });
    fireEvent.click(screen.getByRole('button', { name: 'حفظ التغييرات' }));
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('تم حفظ'));
    expect(JSON.parse(save.mock.calls[0][1].body)).toEqual({ firstName: 'سعود', lastName: '' });
  });
  it('keeps the entered name after a failed save', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 500 })));
    render(<ProfileForm />);
    const input = screen.getByLabelText('الاسم الأول') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'سعود' } });
    fireEvent.click(screen.getByRole('button', { name: 'حفظ التغييرات' }));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('تعذر'));
    expect(input.value).toBe('سعود');
  });
});
