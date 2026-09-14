'use client'
import { useLocale } from 'next-intl'
export default function Loading() {
 const ar = useLocale() === 'ar'
 return <div dir={ar ? 'rtl' : 'ltr'} role="status" className="min-h-screen bg-neutral-950 px-4 py-8 text-base text-white"><div className="mx-auto max-w-4xl space-y-5"><p>{ar ? 'جارٍ تحميل حسابك…' : 'Loading your account…'}</p><div aria-hidden="true" className="h-12 w-48 animate-pulse rounded-lg bg-neutral-800" /><div aria-hidden="true" className="h-56 animate-pulse rounded-xl bg-neutral-900" /></div></div>
}
