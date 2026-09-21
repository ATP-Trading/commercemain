// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const handlers = vi.hoisted(() => ({ daily: vi.fn(), hourly: vi.fn(), weekly: vi.fn() }));
vi.mock('@/lib/services/membership-cron-service', () => ({ cronHandlers: handlers }));
import * as daily from '@/app/api/cron/membership/daily/route';
import * as hourly from '@/app/api/cron/membership/hourly/route';
import * as weekly from '@/app/api/cron/membership/weekly/route';
import { POST as review } from '@/app/api/reviews/route';
import { GET as reviews } from '@/app/api/reviews/product/[productId]/route';
import { POST as vote } from '@/app/api/reviews/vote/[reviewId]/route';

beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal('fetch', vi.fn()); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

// These routes were retired, not left running behind a secret. Even a matching
// historical secret must not restart membership work or return fake success.
for (const [name, routes] of Object.entries({ daily, hourly, weekly })) {
  describe(`retired ${name} membership schedule`, () => {
    for (const method of ['GET', 'POST'] as const) {
      it.each([
        { label: 'no configured secret', secret: '', authorization: undefined },
        { label: 'no credentials', secret: 'test-only-secret', authorization: undefined },
        { label: 'incorrect credentials', secret: 'test-only-secret', authorization: 'Bearer incorrect' },
        { label: 'matching former credentials', secret: 'test-only-secret', authorization: 'Bearer test-only-secret' },
      ])(`${method} stays retired with $label`, async ({ secret, authorization }) => {
        vi.stubEnv('CRON_SECRET', secret);
        const request = new NextRequest(`https://example.test/api/cron/membership/${name}`, {
          method,
          headers: authorization ? { authorization } : {},
        });
        const handler: (request?: NextRequest) => Promise<Response> = routes[method];
        const response = await handler(request);
        expect(response.status).toBe(404);
        expect(await response.json()).toEqual({ error: 'Not found' });
        expect(response.headers.get('set-cookie')).toBeNull();
        expect(handlers.daily).not.toHaveBeenCalled();
        expect(handlers.hourly).not.toHaveBeenCalled();
        expect(handlers.weekly).not.toHaveBeenCalled();
        expect(fetch).not.toHaveBeenCalled();
      });
    }
  });
}

it.each([review, reviews, vote])('does not return mock review success or fake customer feedback', async handler => {
  expect((await handler()).status).toBe(503);
  expect(fetch).not.toHaveBeenCalled();
});
