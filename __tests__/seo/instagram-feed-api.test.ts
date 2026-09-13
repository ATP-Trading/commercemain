// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); vi.resetModules(); });
describe('Instagram diagnostics', () => {
  it('does not disclose provider messages or credentials on failure', async () => {
    vi.stubEnv('INSTAGRAM_ACCESS_TOKEN', 'test-token');
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({ error: { code: 190, error_subcode: 463, message: 'test-token secret provider message' } }) }));
    const { GET } = await import('@/app/api/instagram/route');
    const body = await (await GET(new NextRequest('http://localhost/api/instagram'))).json();
    expect(body).toMatchObject({ posts: [], upstreamStatus: 400, errorCode: 190, errorSubcode: 463 });
    expect(JSON.stringify(body)).not.toMatch(/test-token|secret provider|demo/);
  });
  it('returns no invented posts when unconfigured', async () => {
    vi.stubEnv('INSTAGRAM_ACCESS_TOKEN', '');
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    const { GET } = await import('@/app/api/instagram/route');
    expect((await (await GET(new NextRequest('http://localhost/api/instagram'))).json()).posts).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('caches the full feed and bounds invalid limits', async () => {
    vi.stubEnv('INSTAGRAM_ACCESS_TOKEN', 'test-token');
    const posts = Array.from({ length: 25 }, (_, i) => ({ id: String(i) }));
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: posts }) }); vi.stubGlobal('fetch', fetch);
    const { GET } = await import('@/app/api/instagram/route');
    expect((await (await GET(new NextRequest('http://localhost/api/instagram?limit=2'))).json()).posts).toHaveLength(2);
    expect((await (await GET(new NextRequest('http://localhost/api/instagram?limit=invalid'))).json()).posts).toHaveLength(12);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
