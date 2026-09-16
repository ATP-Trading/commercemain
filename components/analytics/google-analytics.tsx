'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MARKETING_CONSENT_KEY, setMarketingConsent } from '@/lib/analytics/meta';
import { useLocale } from 'next-intl';
import { CONSENT_KEY, CONSENT_EVENT, SETTINGS_EVENT, setAnalyticsConsent, trackPage, trackProduct, type AnalyticsItem } from '@/lib/analytics/ga4';

export function GoogleAnalytics() {
  const pathname = usePathname();
  const ar = useLocale() === 'ar';
  const [show, setShow] = useState(false);
  useEffect(() => {
    try { setShow(!localStorage.getItem(CONSENT_KEY) || !localStorage.getItem(MARKETING_CONSENT_KEY)); } catch { /* No optional storage. */ }
    const open = () => setShow(true);
    window.addEventListener(SETTINGS_EVENT, open);
    return () => window.removeEventListener(SETTINGS_EVENT, open);
  }, []);
  useEffect(() => {
    const track = () => trackPage();
    // Allow the title to settle after a Next.js navigation.
    const timer = setTimeout(track, 0);
    window.addEventListener(CONSENT_EVENT, track);
    return () => { clearTimeout(timer); window.removeEventListener(CONSENT_EVENT, track); };
  }, [pathname]);
  if (!show) return null;
  const choose = (analytics: boolean, marketing: boolean) => { setAnalyticsConsent(analytics); setMarketingConsent(marketing); setShow(false); };
  return <section aria-label={ar ? 'تفضيلات التحليلات' : 'Analytics preferences'} dir={ar ? 'rtl' : 'ltr'} className="fixed bottom-20 md:bottom-4 inset-x-3 z-[70] mx-auto max-w-xl rounded-2xl border border-neutral-700 bg-neutral-950 p-4 text-white shadow-xl">
    <p className="text-sm leading-6">{ar ? 'نستخدم Google Analytics لفهم استخدام الموقع، وMeta لقياس الإعلانات. اختر ملفات تعريف الارتباط التي تسمح بها.' : 'We use Google Analytics to understand site usage and Meta to measure advertising. Choose which cookies to allow.'}</p>
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <button onClick={() => choose(true, true)} className="min-h-11 rounded-lg bg-atp-gold px-5 text-sm font-semibold text-black">{ar ? 'السماح للجميع' : 'Allow all'}</button>
      <button onClick={() => choose(true, false)} className="min-h-11 rounded-lg border border-neutral-500 px-5 text-sm">{ar ? 'التحليلات فقط' : 'Analytics only'}</button>
      <button onClick={() => choose(false, false)} className="min-h-11 rounded-lg border border-neutral-500 px-5 text-sm">{ar ? 'رفض' : 'Decline'}</button>
      <a href={`/${ar ? 'ar' : 'en'}/policies/privacy-policy`} className="text-sm underline">{ar ? 'الخصوصية' : 'Privacy'}</a>
    </div>
  </section>;
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
