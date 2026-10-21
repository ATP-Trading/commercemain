import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
vi.mock('next/navigation', () => ({usePathname: () => '/en'}));
import { GoogleAnalytics, AnalyticsSettingsButton } from '@/components/analytics/google-analytics';
import { analyticsAllowed, trackPage } from '@/lib/analytics/ga4';
import { marketingAllowed } from '@/lib/analytics/meta';
import { measurementMode } from '@/lib/analytics/measurement-mode';
import { handleShopifyVisitRequest } from '@/lib/analytics/shopify-visit-proxy';
afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllGlobals(); });
it.each([false, true])('removes UI and disables tracking with prior consent=%s', prior => {
 Object.defineProperty(window, 'location', {configurable:true, value:new URL('https://www.atpgroupservices.ae/en?atp_measurement=debug')});
 for (const key of ['atp-analytics-consent','atp-google-ads-consent-v1','atp-marketing-consent','atp-shopify-analytics-consent-v1']) {
   if (prior) localStorage.setItem(key, 'granted'); else localStorage.removeItem(key);
 }
 const fetcher = vi.fn().mockResolvedValue(new Response(null,{status:204})); vi.stubGlobal('fetch', fetcher);
 expect(analyticsAllowed()).toBe(false); expect(marketingAllowed()).toBe(false); expect(measurementMode()).toBe('off');
 const view = render(<><GoogleAnalytics/><AnalyticsSettingsButton/></>);
 expect(view.container).toBeEmptyDOMElement(); trackPage();
 expect(document.querySelector('#atp-ga4, #atp-meta-pixel')).toBeNull();
 expect(localStorage.getItem('atp-analytics-consent')).toBe('denied');
 expect(fetcher).toHaveBeenCalledTimes(1);
 expect(fetcher).toHaveBeenCalledWith('/api/analytics/shopify',expect.objectContaining({method:'DELETE'}));
});
it('blocks old client tracking requests without calling Shopify and clears only optional cookies', async () => {
 const upstream = vi.fn();
 const response = await handleShopifyVisitRequest(new Request('https://www.atpgroupservices.ae/api/analytics/shopify', {method:'POST',headers:{origin:'https://www.atpgroupservices.ae','x-atp-analytics-consent':'v1','content-type':'application/json'},body:JSON.stringify({analytics:true})}), {origin:'https://www.atpgroupservices.ae',domain:'test.myshopify.com',token:'test'}, upstream);
 expect(response.status).toBe(204); expect(upstream).not.toHaveBeenCalled();
 expect(response.headers.get('set-cookie')).toContain('_shopify_analytics=;');
 expect(response.headers.get('set-cookie')).not.toContain('_shopify_essential');
});
