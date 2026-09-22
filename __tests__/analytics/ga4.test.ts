import { beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  document.head.innerHTML = '';
  Object.defineProperty(window, 'location', { configurable: true, value: new URL('https://www.atpgroupservices.ae/ar') });
  (window as any).dataLayer = [];
  delete (window as any)['ga-disable-G-N47GG1EVK5'];
});
const events = () => ((window as any).dataLayer as IArguments[]).map(x => Array.from(x));
const measurements = () => events().filter(x => x[0] === 'event');
const allDenied = { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };

describe('GA4 storefront measurement', () => {
  it('does not load or queue analytics before consent or after rejection', async () => {
    const ga = await import('@/lib/analytics/ga4');
    ga.trackPage(); ga.setAnalyticsConsent(false); ga.trackPage();
    expect(events()).toHaveLength(0);
    expect(document.getElementById('atp-ga4')).toBeNull();
  });
  it('records one page view per navigation and loads the existing Shopify stream once', async () => {
    const ga = await import('@/lib/analytics/ga4');
    ga.setAnalyticsConsent(true); ga.trackPage(); ga.trackPage();
    Object.defineProperty(window, 'location', { configurable: true, value: new URL('https://www.atpgroupservices.ae/en') });
    ga.trackPage();
    expect(events().filter(x => x[1] === 'page_view')).toHaveLength(2);
    expect(document.querySelectorAll('#atp-ga4')).toHaveLength(1);
    expect(events().find(x => x[0] === 'config')?.[1]).toBe('G-N47GG1EVK5');
    expect(events().find(x => x[0] === 'config')?.[2]).toMatchObject({ send_page_view: false });
  });
  it('removes private URL parameters and account identifiers', async () => {
    const { safePageUrl } = await import('@/lib/analytics/ga4');
    expect(safePageUrl('https://www.atpgroupservices.ae/ar/account/orders/private?token=secret#email')).toBe('https://www.atpgroupservices.ae/ar/account');
    expect(safePageUrl('https://www.atpgroupservices.ae/ar/search?q=person@example.com')).toBe('https://www.atpgroupservices.ae/ar/search');
    expect(safePageUrl('https://www.atpgroupservices.ae/checkouts/cn/private?gclid=secret&utm_source=private', { campaign: true, advertising: true })).toBe('https://www.atpgroupservices.ae/checkouts');
  });
  it('excludes preview visits and stops events when consent is revoked', async () => {
    const ga = await import('@/lib/analytics/ga4');
    ga.setAnalyticsConsent(true);
    Object.defineProperty(window, 'location', { configurable: true, value: new URL('https://preview.vercel.app/ar') });
    ga.trackPage(); expect(events()).toHaveLength(0);
    Object.defineProperty(window, 'location', { configurable: true, value: new URL('https://www.atpgroupservices.ae/ar') });
    ga.trackPage(); const count = measurements().length;
    ga.setAnalyticsConsent(false);
    ga.trackProduct('add_to_cart', { item_id: '1', item_name: 'Product', price: 99, quantity: 1 }, 'AED');
    expect(measurements()).toHaveLength(count);
    expect(events().filter(x => x[0] === 'consent' && x[1] === 'update').at(-1)?.[2]).toEqual(allDenied);
    expect((window as any)['ga-disable-G-N47GG1EVK5']).toBe(true);
  });
  it('deduplicates product views but preserves separate successful cart additions', async () => {
    const ga = await import('@/lib/analytics/ga4');
    ga.setAnalyticsConsent(true); ga.trackPage();
    const item = { item_id: '1', item_name: 'Coffee', price: 99, quantity: 1 };
    ga.trackProduct('view_item', item, 'AED'); ga.trackProduct('view_item', item, 'AED');
    ga.trackProduct('add_to_cart', item, 'AED'); ga.trackProduct('add_to_cart', item, 'AED');
    expect(events().filter(x => x[1] === 'view_item')).toHaveLength(1);
    expect(events().filter(x => x[1] === 'add_to_cart')).toHaveLength(2);
    expect(events().filter(x => x[1] === 'purchase')).toHaveLength(0);
  });
  it('sends default denied then explicit Google advertising consent before config', async () => {
    const ga = await import('@/lib/analytics/ga4');
    ga.setAnalyticsConsent(true, true); ga.trackPage();
    expect(events()[0]).toEqual(['consent', 'default', allDenied]);
    const i = events().findIndex(x => x[0] === 'consent' && x[1] === 'update');
    expect(events()[i][2]).toEqual({ analytics_storage: 'granted', ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' });
    expect(i).toBeLessThan(events().findIndex(x => x[0] === 'config'));
  });
  it('does not treat a legacy Meta grant as Google advertising consent', async () => {
    const ga = await import('@/lib/analytics/ga4');
    localStorage.setItem(ga.CONSENT_KEY, 'granted');
    localStorage.setItem('atp-marketing-consent', 'granted');
    ga.trackPage();
    expect(ga.googleAdsAllowed()).toBe(false);
    expect(events().find(x => x[0] === 'consent' && x[1] === 'update')?.[2]).toEqual({ ...allDenied, analytics_storage: 'granted' });
  });
  it('preserves allowlisted attribution but excludes click IDs for analytics only', async () => {
    const ga = await import('@/lib/analytics/ga4');
    Object.defineProperty(window, 'location', { configurable: true, value: new URL('https://www.atpgroupservices.ae/en?utm_source=google&gclid=Test123&email=private&token=private') });
    ga.setAnalyticsConsent(true, false); ga.trackPage();
    expect(measurements()[0][2].page_location).toBe('https://www.atpgroupservices.ae/en?utm_source=google');
    ga.setAnalyticsConsent(true, true);
    expect(events().filter(x => x[0] === 'config').at(-1)?.[2]).toMatchObject({ page_location: 'https://www.atpgroupservices.ae/en?utm_source=google&gclid=Test123', send_page_view: false, allow_ad_personalization_signals: true });
    ga.trackPage(); expect(measurements()).toHaveLength(1);
  });
  it('updates stream-level settings on ad withdrawal without a second page view', async () => {
    const ga = await import('@/lib/analytics/ga4');
    ga.setAnalyticsConsent(true, true); ga.trackPage();
    ga.setAnalyticsConsent(true, false); ga.trackPage();
    expect(events().filter(x => x[0] === 'config').at(-1)?.[2]).toMatchObject({ update: true, send_page_view: false, allow_ad_personalization_signals: false });
    expect(measurements()).toHaveLength(1);
    expect(events().filter(x => x[0] === 'consent' && x[1] === 'update').at(-1)?.[2]).toEqual({ ...allDenied, analytics_storage: 'granted' });
  });
  it('drops obvious emails in campaign fields and rejects non-web URLs', async () => {
    const ga = await import('@/lib/analytics/ga4');
    expect(ga.safePageUrl('https://www.atpgroupservices.ae/en?utm_source=person%40example.com&utm_campaign=person%2540example.com', { campaign: true })).toBe('https://www.atpgroupservices.ae/en');
    expect(ga.safePageUrl('javascript:alert(1)')).toBe('');
  });
});
