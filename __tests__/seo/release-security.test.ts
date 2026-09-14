import { expect, it, vi, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
const handlers = vi.hoisted(() => ({ daily: vi.fn(), hourly: vi.fn(), weekly: vi.fn() }))
vi.mock('@/lib/services/membership-cron-service', () => ({ cronHandlers: handlers }))
import { GET as daily } from '@/app/api/cron/membership/daily/route'
import { GET as hourly } from '@/app/api/cron/membership/hourly/route'
import { GET as weekly } from '@/app/api/cron/membership/weekly/route'
import { POST as review } from '@/app/api/reviews/route'
import { GET as reviews } from '@/app/api/reviews/product/[productId]/route'
import { POST as vote } from '@/app/api/reviews/vote/[reviewId]/route'
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks() })
it.each([daily, hourly, weekly])('does not execute scheduled work without a configured secret', async handler => {
 vi.stubEnv('CRON_SECRET', '')
 expect((await handler(new NextRequest('https://example.com/api/cron'))).status).toBe(401)
 expect(handlers.daily).not.toHaveBeenCalled()
 expect(handlers.hourly).not.toHaveBeenCalled()
 expect(handlers.weekly).not.toHaveBeenCalled()
})
it.each([daily, hourly, weekly])('rejects invalid scheduled-task credentials', async handler => {
 vi.stubEnv('CRON_SECRET', 'test-only-secret')
 expect((await handler(new NextRequest('https://example.com/api/cron', {headers:{authorization:'Bearer incorrect'}}))).status).toBe(401)
})
it.each([review,reviews,vote])('does not return mock review success or fake customer feedback', async handler => {
 expect((await handler()).status).toBe(503)
})
