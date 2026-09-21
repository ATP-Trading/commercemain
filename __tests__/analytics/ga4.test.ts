import { beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  document.head.innerHTML = '';
  Object.defineProperty(window, 'location', { configurable: true, value: new URL('https://www.atpgroupservices.ae/ar') });
  (window as Window & { dataLayer: IArguments[] }).dataLayer = [];
});
const events = () => ((window as Window & { dataLayer: IArguments[] }).dataLayer as IArguments[]).map(x => Array.from(x));

describe('GA4 storefront measurement', () => {
  it('does not load or queue analytics before consent or after rejection', async () => {
    const ga = await import('@/lib/analytics/ga4');
    ga.trackPage();
    ga.setAnalyticsConsent(false);
    ga.trackPage();
    expect(events()).toHaveLength(0);
    expect(document.getElementById('atp-ga4')).toBeNull();
  });
  it('records one page view per navigation and loads the existing Shopify stream once', async () => {
    const ga = await import('@/lib/analytics/ga4');
    ga.setAnalyticsConsent(true);
    ga.trackPage(); ga.trackPage();
    Object.defineProperty(window, 'location', { configurable: true, value: new URL('https://www.atpgroupservices.ae/en') });
    ga.trackPage();
    expect(events().filter(x => x[1] === 'page_view')).toHaveLength(2);
    expect(document.querySelectorAll('#atp-ga4')).toHaveLength(1);
    expect(events().find(x => x[0] === 'config')?.[1]).toBe('G-N47GG1EVK5');
    expect(events().find(x => x[0] === 'config')?.[2]).toMatchObject({send_page_view:false});
  });
  it('removes private URL parameters and account identifiers', async () => {
    const { safePageUrl } = await import('@/lib/analytics/ga4');
    expect(safePageUrl('https://www.atpgroupservices.ae/ar/account/orders/private?token=secret#email')).toBe('https://www.atpgroupservices.ae/ar/account');
    expect(safePageUrl('https://www.atpgroupservices.ae/ar/search?q=person@example.com')).toBe('https://www.atpgroupservices.ae/ar/search');
  });
  it('excludes preview visits and stops events when consent is revoked', async () => {
    const ga = await import('@/lib/analytics/ga4');
    ga.setAnalyticsConsent(true);
    Object.defineProperty(window, 'location', { configurable: true, value: new URL('https://preview.vercel.app/ar') });
    ga.trackPage();
    expect(events()).toHaveLength(0);
    Object.defineProperty(window, 'location', { configurable: true, value: new URL('https://www.atpgroupservices.ae/ar') });
    ga.trackPage();
    const count = events().length;
    ga.setAnalyticsConsent(false);
    ga.trackProduct('add_to_cart', {item_id:'1',item_name:'Product',price:99,quantity:1}, 'AED');
    expect(events()).toHaveLength(count);
    expect((window as unknown as Record<string, unknown>)['ga-disable-G-N47GG1EVK5']).toBe(true);
  });
  it('deduplicates product views but preserves separate successful cart additions', async () => {
    const ga = await import('@/lib/analytics/ga4');
    ga.setAnalyticsConsent(true); ga.trackPage();
    const item = {item_id:'1', item_name:'Coffee', price:99, quantity:1};
    ga.trackProduct('view_item',item,'AED'); ga.trackProduct('view_item',item,'AED');
    ga.trackProduct('add_to_cart',item,'AED'); ga.trackProduct('add_to_cart',item,'AED');
    expect(events().filter(x=>x[1]==='view_item')).toHaveLength(1);
    expect(events().filter(x=>x[1]==='add_to_cart')).toHaveLength(2);
    expect(events().filter(x=>x[1]==='purchase')).toHaveLength(0);
  });
});
