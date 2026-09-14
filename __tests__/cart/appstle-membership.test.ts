import { describe, expect, it } from 'vitest';
import { getActiveAtpSubscription } from '@/lib/shopify/appstle-membership';
const member = { id: 1, status: 'active', variantIds: [46301020094702] };
describe('Appstle membership eligibility', () => {
  it('recognizes the active ATP membership product', () => {
    expect(getActiveAtpSubscription(JSON.stringify([member]))?.id).toBe(1);
  });
  it.each(['paused', 'cancelled', 'expired', 'pending'])('rejects %s memberships', status => {
    expect(getActiveAtpSubscription(JSON.stringify([{ ...member, status }]))).toBeNull();
  });
  it('does not grant membership for another subscription product', () => {
    expect(getActiveAtpSubscription(JSON.stringify([{ ...member, variantIds: [123] }]))).toBeNull();
  });
  it.each([null, '', 'invalid', '{}', '[null]', '[{"status":"active"}]'])('rejects absent or malformed data: %s', value => {
    expect(getActiveAtpSubscription(value)).toBeNull();
  });
});
