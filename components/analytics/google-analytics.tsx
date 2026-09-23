'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MARKETING_CONSENT_KEY, setMarketingConsent } from '@/lib/analytics/meta';
import { useLocale } from 'next-intl';
import { ShopifyStorefrontAnalytics } from './shopify-storefront-analytics';
import { hasShopifyVisitChoice, setShopifyVisitConsent } from '@/lib/analytics/shopify-visits';
import { CONSENT_KEY, GOOGLE_ADS_CONSENT_KEY, CONSENT_EVENT, SETTINGS_EVENT, setAnalyticsConsent, trackPage, trackProduct, type AnalyticsItem } from '@/lib/analytics/ga4';

export function GoogleAnalytics() {
  const pathname = usePathname();
  const ar = useLocale() === 'ar';
  const [show, setShow] = useState(false);
  useEffect(() => {
    // Shopify analytics is newly disclosed; don't reuse a Google-only grant for it.
    try { setShow(!localStorage.getItem(CONSENT_KEY) || !localStorage.getItem(MARKETING_CONSENT_KEY) || !localStorage.getItem(GOOGLE_ADS_CONSENT_KEY) || !hasShopifyVisitChoice()); } catch { /* No optional storage. */ }
    const open = () => setShow(true);
    window.addEventListener(SETTINGS_EVENT, open);
    return () => window.removeEventListener(SETTINGS_EVENT, open);
  }, []);
  useEffect(() => {
    const track = () => trackPage();
    const timer = setTimeout(track, 0);
    window.addEventListener(CONSENT_EVENT, track);
    return () => { clearTimeout(timer); window.removeEventListener(CONSENT_EVENT, track); };
  }, [pathname]);
  const choose = (analytics: boolean, marketing: boolean) => {
    setShopifyVisitConsent(analytics);
    setAnalyticsConsent(analytics, marketing);
    setMarketingConsent(marketing);
    setShow(false);
  };
  return <><ShopifyStorefrontAnalytics />{show && <section aria-label={ar ? 'تفضيلات التحليلات' : 'Analytics preferences'} dir={ar ? 'rtl' : 'ltr'} className="fixed bottom-20 md:bottom-4 inset-x-3 z-[70] mx-auto max-w-xl rounded-2xl border border-neutral-700 bg-neutral-950 p-4 text-white shadow-xl">
    <p className="text-sm leading-6">{ar ? 'نستخدم Google Analytics وShopify لفهم استخدام الموقع، وGoogle وMeta لقياس الإعلانات وتخصيصها. اختر ملفات تعريف الارتباط التي تسمح بها. يمكنك تغيير اختيارك من تفضيلات التحليلات.' : 'We use Google Analytics and Shopify to understand site usage, and Google and Meta to measure and personalise ads. Choose which cookies to allow. You can change your choice in Analytics preferences.'}</p>
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <button onClick={() => choose(true, true)} className="min-h-11 rounded-lg bg-atp-gold px-5 text-sm font-semibold text-black">{ar ? 'السماح للجميع' : 'Allow all'}</button>
      <button onClick={() => choose(true, false)} className="min-h-11 rounded-lg border border-neutral-500 px-5 text-sm">{ar ? 'التحليلات فقط' : 'Analytics only'}</button>
      <button onClick={() => choose(false, false)} className="min-h-11 rounded-lg border border-neutral-500 px-5 text-sm">{ar ? 'رفض' : 'Decline'}</button>
      <a href={`/${ar ? 'ar' : 'en'}/policies/privacy-policy`} className="text-sm underline">{ar ? 'الخصوصية' : 'Privacy'}</a>
    </div>
  </section>}</>;
}

export function AnalyticsSettingsButton() {
  const ar = useLocale() === 'ar';
  return <button className="min-h-11 text-sm hover:text-white" onClick={() => window.dispatchEvent(new Event(SETTINGS_EVENT))}>{ar ? 'تفضيلات التحليلات' : 'Analytics preferences'}</button>;
}

export function ProductAnalytics({ item, currency }: { item: AnalyticsItem; currency: string }) {
  const pathname = usePathname();
  useEffect(() => {
    const track = () => { trackPage(); trackProduct('view_item', item, currency); };
    const timer = setTimeout(track, 0);
    window.addEventListener(CONSENT_EVENT, track);
    return () => { clearTimeout(timer); window.removeEventListener(CONSENT_EVENT, track); };
  }, [pathname, item.item_id, item.item_name, item.price, item.quantity, currency]);
  return null;
}
