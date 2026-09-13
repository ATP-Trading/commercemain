import { describe, expect, it } from 'vitest';
import { getSiteUrl } from '@/lib/site-url';
describe('canonical site origin', () => {
  it.each([undefined, '', 'https://atpgroupservices.ae', 'http://atpgroupservices.ae/en', 'https://www.atpgroupservices.ae/'])('normalizes %s to the verified production origin', (value) => {
    expect(getSiteUrl(value)).toBe('https://www.atpgroupservices.ae');
  });
  it('supports an explicitly configured development origin', () => {
    expect(getSiteUrl('http://localhost:3100/')).toBe('http://localhost:3100');
  });
});
