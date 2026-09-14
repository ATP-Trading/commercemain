import { beforeEach, describe, expect, it, vi } from 'vitest';
const auth = vi.hoisted(() => ({ token: vi.fn(), query: vi.fn() }));
vi.mock('@/lib/shopify/customer-account-oauth', () => ({ getValidAccessToken: auth.token, queryCustomerAccountApi: auth.query }));
vi.mock('@/lib/config', () => ({ config: { shopify: { domain: 'example.myshopify.com', apiVersion: '2026-01' } } }));
import { GET } from '@/app/api/membership/status/route';
describe('Membership status session binding', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('SHOPIFY_ADMIN_ACCESS_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn());
  });
  it('does not query Shopify Admin for a guest', async () => {
    auth.token.mockResolvedValue(null);
    expect((await (await GET()).json()).isMember).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('queries only the authenticated customer and returns active membership', async () => {
    auth.token.mockResolvedValue('session-token');
    auth.query.mockResolvedValue({ data: { customer: { id: 'gid://shopify/Customer/123' } } });
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ data: { customer: { metafield: { value: JSON.stringify([{ id: 9, status: 'active', variantIds: [46301020094702] }]) } } } })));
    const response = await GET();
    expect((await response.json()).isMember).toBe(true);
    expect(JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string).variables.id).toBe('gid://shopify/Customer/123');
    expect(response.headers.get('Cache-Control')).toContain('no-store');
  });
  it('does not query Admin when customer authentication fails', async () => {
    auth.token.mockResolvedValue('session-token');
    auth.query.mockResolvedValue({ errors: [{ message: 'Unauthorized' }] });
    expect((await GET()).status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('reports a lookup failure rather than a successful non-member result', async () => {
    auth.token.mockResolvedValue('session-token');
    auth.query.mockResolvedValue({ data: { customer: { id: 'gid://shopify/Customer/123' } } });
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 403 }));
    expect((await GET()).status).toBe(503);
  });
});

it('recognizes a merchant-granted membership from server-owned tags', async () => {
  auth.token.mockResolvedValue('session-token');
  auth.query.mockResolvedValue({data:{customer:{id:'gid://shopify/Customer/123'}}});
  vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({data:{customer:{tags:['atp-member'],metafield:null}}})));
  const data = await (await GET()).json();
  expect(data).toMatchObject({isMember:true,discountRate:0.15,membership:{source:'merchant',status:'active'}});
  expect(JSON.parse(vi.mocked(fetch).mock.calls.at(-1)![1]!.body as string).query).toContain('tags');
});
