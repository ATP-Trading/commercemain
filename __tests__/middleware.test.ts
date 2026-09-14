// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy, config } from '../proxy';

describe('Current next-intl routing proxy', () => {
  it('redirects unprefixed pages to the requested language, preserving queries', () => {
    const response = proxy(new NextRequest('https://www.atpgroupservices.ae/about?q=coffee', {
      headers: { 'accept-language': 'ar,en;q=0.9' },
    }));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://www.atpgroupservices.ae/ar/about?q=coffee');
  });
  it('uses the language preference cookie when a path has no language', () => {
    const response = proxy(new NextRequest('https://www.atpgroupservices.ae/about', {
      headers: { cookie: 'NEXT_LOCALE=ar', 'accept-language': 'en' },
    }));
    expect(response.headers.get('location')).toBe('https://www.atpgroupservices.ae/ar/about');
  });
  it.each(['en', 'ar'])('keeps explicit %s pages in their requested language', locale => {
    const response = proxy(new NextRequest(`https://www.atpgroupservices.ae/${locale}/about`));
    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });
  it.each(['/api/auth/callback', '/trpc/query', '/_next/static/main.js', '/_vercel/insights', '/favicon.ico'])('excludes %s from the language proxy matcher', path => {
    expect(new RegExp(`^${config.matcher}$`).test(path)).toBe(false);
  });
  it.each(['/', '/en/about', '/ar/account', '/product/coffee'])('matches public route %s', path => {
    expect(new RegExp(`^${config.matcher}$`).test(path)).toBe(true);
  });
});
