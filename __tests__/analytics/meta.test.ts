import { beforeEach, expect, it, vi } from 'vitest'
beforeEach(() => {
 vi.resetModules(); localStorage.clear(); document.head.innerHTML='';
 Object.defineProperty(window,'location',{configurable:true,value:new URL('https://www.atpgroupservices.ae/en')});
 window.fbq=undefined; window._fbq=undefined;
})
it('does not treat old analytics consent as marketing consent', async () => {
 localStorage.setItem('atp-analytics-consent','granted');
 const meta = await import('@/lib/analytics/meta'); meta.trackMetaPage();
 expect(window.fbq).toBeUndefined(); expect(document.querySelector('#atp-meta-pixel')).toBeNull();
})
it('excludes previews even after marketing consent', async () => {
 Object.defineProperty(window,'location',{configurable:true,value:new URL('https://preview.vercel.app/en')});
 const meta = await import('@/lib/analytics/meta'); meta.setMarketingConsent(true); meta.trackMetaPage();
 expect(window.fbq).toBeUndefined();
})
it('uses one dataset and one page view per navigation without purchase events', async () => {
 const meta = await import('@/lib/analytics/meta'); meta.setMarketingConsent(true);
 meta.trackMetaPage(); meta.trackMetaPage();
 Object.defineProperty(window,'location',{configurable:true,value:new URL('https://www.atpgroupservices.ae/ar')}); meta.trackMetaPage();
 expect(window.fbq.queue.filter((x: unknown[])=>x[0]==='init')).toEqual([['init',meta.META_PIXEL_ID]]);
 expect(window.fbq.queue.filter((x: unknown[])=>x[0]==='trackSingle')).toEqual([['trackSingle',meta.META_PIXEL_ID,'PageView'],['trackSingle',meta.META_PIXEL_ID,'PageView']]);
 expect(document.querySelectorAll('#atp-meta-pixel')).toHaveLength(1);
})
it('stops events after revocation and resumes only with renewed consent', async () => {
 const meta = await import('@/lib/analytics/meta'); meta.setMarketingConsent(true); meta.trackMetaPage();
 meta.setMarketingConsent(false); const length=window.fbq.queue.length; meta.trackMetaPage();
 expect(window.fbq.queue).toHaveLength(length); expect(window.fbq.queue[length-1]).toEqual(['consent','revoke']);
 meta.setMarketingConsent(true); meta.trackMetaPage(); expect(window.fbq.queue.at(-1)).toEqual(['trackSingle',meta.META_PIXEL_ID,'PageView']);
})
it.each(['/en/account/profile','/en/auth/callback','/en/search','/en/login'])('excludes private route %s', async path => {
 const meta = await import('@/lib/analytics/meta'); meta.setMarketingConsent(true);
 Object.defineProperty(window,'location',{configurable:true,value:new URL('https://www.atpgroupservices.ae'+path)}); meta.trackMetaPage(); expect(window.fbq).toBeUndefined();
})
