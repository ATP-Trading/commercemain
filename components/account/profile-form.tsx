'use client'

import { useState, type FormEvent } from 'react'
import { useLocale } from 'next-intl'
import { useCustomerOAuth } from '@/hooks/use-customer-oauth'
import { AccountShell } from './account-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const copy = {
  ar: { title: 'تعديل الملف الشخصي', back: 'العودة إلى حسابي', first: 'الاسم الأول', last: 'اسم العائلة (اختياري)', email: 'البريد الإلكتروني', save: 'حفظ التغييرات', saving: 'جارٍ الحفظ…', saved: 'تم حفظ اسمك بنجاح.', failed: 'تعذر حفظ التغييرات. حاول مرة أخرى.', loading: 'جارٍ تحميل بيانات حسابك…', loadError: 'تعذر تحميل بيانات الحساب.', retry: 'حاول مرة أخرى', login: 'سجّل الدخول لتعديل بياناتك', signIn: 'تسجيل الدخول', expired: 'انتهت جلسة الدخول. سجّل الدخول مجددًا ثم احفظ التغييرات.' },
  en: { title: 'Edit profile', back: 'Back to my account', first: 'First name', last: 'Last name (optional)', email: 'Email address', save: 'Save changes', saving: 'Saving…', saved: 'Your name has been saved.', failed: 'We could not save your changes. Please try again.', loading: 'Loading your profile…', loadError: 'We could not load your profile.', retry: 'Try again', login: 'Sign in to edit your profile', signIn: 'Sign in', expired: 'Your session has expired. Sign in again, then save your changes.' },
}

export function ProfileForm() {
  const locale = useLocale()
  const t = copy[locale === 'ar' ? 'ar' : 'en']
  return <AccountShell title={t.title} path="/account/profile"><ProfileDetails /></AccountShell>
}
function ProfileDetails() {
  const locale = useLocale(), t = copy[locale === 'ar' ? 'ar' : 'en']
  const { customer, isLoading, error, login, refreshCustomer } = useCustomerOAuth()
  if (isLoading) return <p role="status">{t.loading}</p>
  if (error) return <div role="alert"><p>{t.loadError}</p><Button onClick={() => void refreshCustomer()}>{t.retry}</Button></div>
  if (!customer) return <Button onClick={() => login(`/${locale}/account/profile`)}>{t.signIn}</Button>
  return <div className="max-w-xl space-y-4"><p className="text-neutral-300">{locale === 'ar' ? 'عدّل اسمك هنا. لإضافة عنوان التوصيل ورقم التواصل، افتح «عناويني».' : 'Update your name here. Open My addresses to add a delivery address and contact number.'}</p><NameForm key={customer.id} customer={customer} t={t} login={() => login(`/${locale}/account/profile`)} /></div>
}

function NameForm({ customer, t, login }: { customer: { firstName: string | null; lastName: string | null; email: string | null }; t: typeof copy.en; login: () => void }) {
  const [firstName, setFirstName] = useState(customer.firstName ?? '')
  const [lastName, setLastName] = useState(customer.lastName ?? '')
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<'saved' | 'failed' | 'expired' | null>(null)
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setResult(null)
    try {
      const response = await fetch('/api/customer/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim() }) })
      if (response.status === 401) { setResult('expired'); return }
      const data = await response.json()
      if (!response.ok || !data.success || !data.customer) throw new Error('Save failed')
      setFirstName(data.customer.firstName ?? '')
      setLastName(data.customer.lastName ?? '')
      setResult('saved')
    } catch { setResult('failed') } finally { setSaving(false) }
  }
  return <form onSubmit={save} className="space-y-5 rounded-xl border border-neutral-700 bg-neutral-900 p-5 sm:p-7">
    <fieldset disabled={saving} className="space-y-5">
      <div className="space-y-2"><Label htmlFor="profile-first-name">{t.first}</Label><Input id="profile-first-name" autoComplete="given-name" required maxLength={100} value={firstName} onChange={event => { setFirstName(event.target.value); setResult(null) }} /></div>
      <div className="space-y-2"><Label htmlFor="profile-last-name">{t.last}</Label><Input id="profile-last-name" autoComplete="family-name" maxLength={100} value={lastName} onChange={event => { setLastName(event.target.value); setResult(null) }} /></div>
      <div className="space-y-2"><span className="text-base font-medium">{t.email}</span><p dir="ltr" className="break-words text-neutral-300">{customer.email}</p><p className="text-sm leading-relaxed text-neutral-400">{t === copy.ar ? 'هذا بريد تسجيل الدخول. لا يتم تغييره من نموذج الاسم.' : 'This is your sign-in email. It cannot be changed using this name form.'}</p></div>
      <Button type="submit" className="w-full bg-atp-gold text-black hover:bg-atp-gold/90">{saving ? t.saving : t.save}</Button>
    </fieldset>
    {result && <p role={result === 'saved' ? 'status' : 'alert'} className={result === 'saved' ? 'text-green-300' : 'text-red-300'}>{t[result]}</p>}
    {result === 'expired' && <Button type="button" onClick={login}>{t.signIn}</Button>}
  </form>
}
