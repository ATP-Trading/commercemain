// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({ token: vi.fn(), query: vi.fn(), adminToken: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('@/lib/shopify/customer-account-oauth', () => ({ getValidAccessToken: auth.token, queryCustomerAccountApi: auth.query }));
vi.mock('@/lib/shopify/admin-access-token', () => ({ getAdminAccessToken: auth.adminToken }));
vi.mock('@/lib/config', () => ({ config: { shopify: { domain: 'example.myshopify.com', apiVersion: '2026-01' } } }));
import { GET } from '@/app/api/membership/status/route';

const customerId = 'gid://shopify/Customer/123';
function signedIn() {
  auth.token.mockResolvedValue('session-token');
  auth.query.mockResolvedValue({ data: { customer: { id: customerId } } });
}
beforeEach(() => {
  vi.resetAllMocks();
  auth.adminToken.mockResolvedValue('isolated-admin-token');
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Unexpected unconfigured test request')));
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('Membership status session binding', () => {
  it('does not query Shopify Admin for a guest', async () => {
    auth.token.mockResolvedValue(null);
    expect((await (await GET()).json()).isMember).toBe(false);
    expect(auth.adminToken).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('queries only the authenticated customer and returns active membership', async () => {
    signedIn();
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ data: { customer: { metafield: { value: JSON.stringify([{ id: 9, status: 'active', variantIds: [46301020094702] }]) } } } })));
    const response = await GET();
    expect(response.status).toBe(200);
    expect((await response.json()).isMember).toBe(true);
    expect(auth.query).toHaveBeenCalledWith('session-token', expect.stringContaining('MembershipIdentity'));
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, options] = vi.mocked(fetch).mock.calls[0]!;
    expect(url).toBe('https://example.myshopify.com/admin/api/2026-01/graphql.json');
    expect(JSON.parse(options!.body as string).variables.id).toBe(customerId);
    expect(new Headers(options!.headers).get('X-Shopify-Access-Token')).toBe('isolated-admin-token');
    expect(options!.cache).toBe('no-store');
    expect(response.headers.get('Cache-Control')).toContain('no-store');
  });

  it('does not query Admin when customer authentication fails', async () => {
    auth.token.mockResolvedValue('session-token');
    auth.query.mockResolvedValue({ errors: [{ message: 'Unauthorized' }] });
    expect((await GET()).status).toBe(401);
    expect(auth.adminToken).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('reports a lookup failure rather than a successful non-member result', async () => {
    signedIn();
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 403 }));
    expect((await GET()).status).toBe(503);
  });

  it('recognizes a merchant-granted membership from server-owned tags', async () => {
    signedIn();
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ data: { customer: { tags: ['atp-member'], metafield: null } } })));
    const data = await (await GET()).json();
    expect(data).toMatchObject({ isMember: true, discountRate: 0.15, membership: { source: 'merchant', status: 'active' } });
    const request = JSON.parse(vi.mocked(fetch).mock.calls[0]![1]!.body as string);
    expect(request.query).toContain('tags');
    expect(request.variables.id).toBe(customerId);
  });

  it('does not grant membership to an ordinary signed-in customer', async () => {
    signedIn();
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ data: { customer: { tags: [], metafield: null } } })));
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ isMember: false, discountRate: 0, membership: null });
  });

  it('does not query Admin when the authenticated customer ID is missing', async () => {
    auth.token.mockResolvedValue('session-token');
    auth.query.mockResolvedValue({ data: { customer: null } });
    expect((await GET()).status).toBe(401);
    expect(auth.adminToken).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('reports credential-provider failure without querying Shopify or granting membership', async () => {
    signedIn();
    auth.adminToken.mockRejectedValue(new Error('Token unavailable'));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ isMember: false, error: 'Unable to load membership status' });
    expect(fetch).not.toHaveBeenCalled();
  });
});
