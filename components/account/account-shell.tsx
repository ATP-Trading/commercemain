'use client'
import { useLocale } from 'next-intl'
import { useCustomerOAuth } from '@/hooks/use-customer-oauth'
import { Link } from '@/src/i18n/navigation'
import { Button } from '@/components/ui/button'
import type { ReactNode } from 'react'
export function AccountShell({ title, path, children }: { title: string; path: string; children: ReactNode }) {
  const locale = useLocale(), ar = locale === 'ar'
  const { customer, isLoading, error, login, logout, refreshCustomer } = useCustomerOAuth()
  return <main dir={ar ? 'rtl' : 'ltr'} className="min-h-screen bg-neutral-950 px-4 pb-28 pt-6 sm:py-8 text-base leading-relaxed text-white [&_input]:min-h-12 [&_input]:text-base [&_label]:text-base [&_button]:min-h-12 [&_button]:text-base"><div className="mx-auto max-w-4xl space-y-6">
    {path !== '/account' && <Button asChild variant="outline" className="bg-neutral-900 hover:bg-neutral-800 hover:text-atp-gold min-h-12 border-atp-gold px-5 text-base font-semibold text-atp-gold"><Link href="/account"><span aria-hidden="true">{ar ? '→' : '←'}</span>{ar ? 'العودة إلى حسابي' : 'Back to my account'}</Link></Button>}
    <div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl font-semibold">{title}</h1>{customer && <Button variant="outline" className="border-neutral-600 bg-neutral-900 text-white hover:bg-neutral-800 hover:text-white" onClick={() => logout(`/${locale}`)}>{ar ? 'تسجيل الخروج' : 'Sign out'}</Button>}</div>
    {customer && <div className="space-y-1 text-neutral-300"><p className="text-lg">{[customer.firstName, customer.lastName].filter(Boolean).join(' ') || (ar ? 'أهلًا بك' : 'Welcome')}</p><p dir="ltr" className="break-words">{customer.email}</p></div>}
    <nav aria-label={ar ? 'حسابي' : 'My account'} className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">{[['/account', ar ? 'حسابي' : 'My account'], ['/account/orders', ar ? 'طلباتي' : 'My orders'], ['/account/profile', ar ? 'بياناتي الشخصية' : 'Personal details'], ['/account/addresses', ar ? 'عناويني' : 'My addresses'], ['/account/membership', ar ? 'عضوية ATP' : 'ATP membership'], ['/account/payment-methods', ar ? 'الدفع' : 'Payment']].map(([href, label]) => <Link key={href} href={href} aria-current={path === href ? 'page' : undefined} className={`inline-flex min-h-12 items-center justify-center rounded-lg border px-3 py-3 text-center text-base font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-atp-gold ${path === href ? 'border-atp-gold bg-atp-gold text-black' : 'border-neutral-700 hover:border-atp-gold'}`}>{label}</Link>)}</nav>
    {isLoading ? <p role="status">{ar ? 'جارٍ تحميل حسابك…' : 'Loading your account…'}</p> : error ? <div role="alert"><p>{ar ? 'تعذر تحميل الحساب.' : 'Unable to load your account.'}</p><Button onClick={() => void refreshCustomer()}>{ar ? 'حاول مرة أخرى' : 'Try again'}</Button></div> : !customer ? <div className="space-y-4"><p>{ar ? 'سجّل الدخول للاطلاع على طلباتك وبياناتك المحفوظة.' : 'Sign in to see your orders and saved details.'}</p><Button onClick={() => login(`/${locale}${path}`)}>{ar ? 'تسجيل الدخول' : 'Sign in'}</Button></div> : children}
  </div></main>
}
