import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const auth = vi.hoisted(() => ({ loggedIn: vi.fn(), token: vi.fn(), query: vi.fn() }));
vi.mock('@/lib/shopify/customer-account-oauth', () => ({ isLoggedIn: auth.loggedIn, getValidAccessToken: auth.token, queryCustomerAccountApi: auth.query }));
import { PUT } from '@/app/api/customer/profile/route';
const request = (body: unknown) => new NextRequest('https://example.com/api/customer/profile', { method: 'PUT', body: JSON.stringify(body) });
describe('Profile name updates', () => {
  beforeEach(() => { vi.resetAllMocks(); auth.loggedIn.mockResolvedValue(true); auth.token.mockResolvedValue('session'); });
  it('saves a first name without requiring a last name', async () => {
    auth.query.mockResolvedValue({ data: { customerUpdate: { customer: { id: '1', firstName: 'سعود', lastName: null }, userErrors: [] } } });
    const response = await PUT(request({ firstName: ' سعود ', lastName: '' }));
    expect(response.status).toBe(200);
    expect(auth.query.mock.calls[0][2]).toEqual({ input: { firstName: 'سعود', lastName: '' } });
    expect((await response.json()).customer.firstName).toBe('سعود');
  });
  it.each([{}, { firstName: '   ' }, { email: 'test@example.com' }])('rejects invalid or unsupported updates %j', async body => {
    expect((await PUT(request(body))).status).toBe(400);
    expect(auth.query).not.toHaveBeenCalled();
  });
  it('never reports success without a saved customer', async () => {
    auth.query.mockResolvedValue({ data: { customerUpdate: { customer: null, userErrors: [] } } });
    expect((await PUT(request({ firstName: 'Saud' }))).status).toBe(502);
  });
  it('rejects expired sessions', async () => {
    auth.token.mockResolvedValue(null);
    expect((await PUT(request({ firstName: 'Saud' }))).status).toBe(401);
    expect(auth.query).not.toHaveBeenCalled();
  });
  it('surfaces rejected Shopify updates without a success result', async () => {
    auth.query.mockResolvedValue({ data: { customerUpdate: { customer: null, userErrors: [{ message: 'Invalid name', field: ['firstName'] }] } } });
    expect((await PUT(request({ firstName: 'Saud' }))).status).toBe(400);
  });
});
