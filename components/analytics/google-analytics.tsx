'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { CONSENT_KEY, CONSENT_EVENT, SETTINGS_EVENT, setAnalyticsConsent, trackPage, trackProduct, type AnalyticsItem } from '@/lib/analytics/ga4';

export function GoogleAnalytics() {
  const pathname = usePathname();
  const ar = useLocale() === 'ar';
  const [show, setShow] = useState(false);
  useEffect(() => {
    try { setShow(!localStorage.getItem(CONSENT_KEY)); } catch { /* No optional storage. */ }
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
  const choose = (allowed: boolean) => { setAnalyticsConsent(allowed); setShow(false); };
  return <section aria-label={ar ? 'تفضيلات التحليلات' : 'Analytics preferences'} dir={ar ? 'rtl' : 'ltr'} className="fixed bottom-20 md:bottom-4 inset-x-3 z-[70] mx-auto max-w-xl rounded-2xl border border-neutral-700 bg-neutral-950 p-4 text-white shadow-xl">
    <p className="text-sm leading-6">{ar ? 'تسمح لنا تحليلات Google بفهم استخدام الموقع وتحسين تجربة التسوق. هل تسمح بملفات تعريف الارتباط للتحليلات؟' : 'Google Analytics helps us understand site usage and improve your shopping experience. Allow analytics cookies?'}</p>
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <button onClick={() => choose(true)} className="min-h-11 rounded-lg bg-atp-gold px-5 text-sm font-semibold text-black">{ar ? 'السماح' : 'Allow'}</button>
      <button onClick={() => choose(false)} className="min-h-11 rounded-lg border border-neutral-500 px-5 text-sm">{ar ? 'رفض' : 'Decline'}</button>
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
