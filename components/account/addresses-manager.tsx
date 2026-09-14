'use client'
import { useState, type FormEvent } from 'react'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from '@/src/i18n/navigation'
import { useAccountList } from '@/hooks/use-account-list'
import { AccountShell } from './account-shell'
type Address = { id: string; firstName: string | null; lastName: string | null; company: string | null; address1: string | null; address2: string | null; city: string | null; province: string | null; country: string | null; territoryCode: string | null; zoneCode: string | null; zip: string | null; phoneNumber: string | null }
const emirates = [['DU', 'دبي', 'Dubai'], ['AZ', 'أبوظبي', 'Abu Dhabi'], ['SH', 'الشارقة', 'Sharjah'], ['AJ', 'عجمان', 'Ajman'], ['UQ', 'أم القيوين', 'Umm Al Quwain'], ['RK', 'رأس الخيمة', 'Ras Al Khaimah'], ['FU', 'الفجيرة', 'Fujairah']]
export function AddressesPageContent() { const ar = useLocale() === 'ar'; return <AccountShell title={ar ? 'عناويني' : 'My addresses'} path="/account/addresses"><AddressesManager /></AccountShell> }
export function AddressesManager() {
  const ar = useLocale() === 'ar'
  const { items, loading, error, expired, defaultId, page, load } = useAccountList<Address>('/api/customer/addresses')
  const [editing, setEditing] = useState<Address | 'new' | null>(null), [saved, setSaved] = useState(false)
  return <section className="space-y-5">
    <p className="text-neutral-300">{ar ? 'احفظ عنوان التوصيل ورقم التواصل لاستخدامهما في طلباتك القادمة. تعديل العنوان هنا لا يغيّر عنوان طلب سابق.' : 'Save delivery addresses and contact numbers for future orders. Changes here do not change the address on an existing order.'}</p>
    {saved && <p role="status" className="text-green-300">{ar ? 'تم حفظ العنوان في حسابك.' : 'Address saved to your account.'}</p>}
    {!expired && <Button disabled={loading || !!editing} onClick={() => { setEditing('new'); setSaved(false) }}>{ar ? 'إضافة عنوان' : 'Add address'}</Button>}
    {editing && <AddressForm key={editing === 'new' ? 'new' : editing.id} address={editing === 'new' ? undefined : editing} isDefault={editing !== 'new' && editing.id === defaultId} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); setSaved(true); void load() }} />}
    {items.map(address => <article key={address.id} className="space-y-2 rounded-xl border border-neutral-700 bg-neutral-900 p-5">
      <h2 className="text-lg font-semibold">{address.firstName} {address.lastName}</h2>
      {address.id === defaultId && <p className="text-sm text-atp-gold">{ar ? 'العنوان الافتراضي' : 'Default address'}</p>}
      {address.company && <p>{address.company}</p>}<p>{address.address1}</p>{address.address2 && <p>{address.address2}</p>}<p>{[address.city, address.province, address.zip, address.country].filter(Boolean).join('، ')}</p>{address.phoneNumber && <p dir="ltr">{address.phoneNumber}</p>}
      <Button variant="outline" disabled={loading || !!editing} onClick={() => { setEditing(address); setSaved(false) }}>{ar ? 'تعديل العنوان' : 'Edit address'}</Button>
    </article>)}
    {loading && <p role="status">{ar ? 'جارٍ تحميل العناوين…' : 'Loading addresses…'}</p>}
    {expired ? <p role="alert"><Link href="/login">{ar ? 'انتهت الجلسة. سجّل الدخول مجددًا.' : 'Session expired. Sign in again.'}</Link></p> : error ? <div role="alert"><p>{ar ? 'تعذر تحميل العناوين.' : 'Unable to load addresses.'}</p><Button onClick={() => void load(items.length ? page.endCursor : null)}>{ar ? 'حاول مرة أخرى' : 'Try again'}</Button></div> : !loading && !items.length && !editing ? <p>{ar ? 'ما عندك عناوين محفوظة حتى الآن.' : 'No saved addresses yet.'}</p> : null}
    {page.hasNextPage && !expired && !error && <Button disabled={loading || !!editing} onClick={() => void load(page.endCursor)}>{ar ? 'عرض عناوين إضافية' : 'Load more addresses'}</Button>}
  </section>
}
function AddressForm({ address, isDefault, onCancel, onSaved }: { address?: Address; isDefault: boolean; onCancel: () => void; onSaved: () => void }) {
  const ar = useLocale() === 'ar'
  const [saving, setSaving] = useState(false), [error, setError] = useState<'save' | 'expired' | null>(null)
  const country = address?.territoryCode || 'AE'
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget)
    setSaving(true); setError(null)
    const fields = ['firstName', 'lastName', 'company', 'address1', 'address2', 'city', 'zoneCode', 'zip', 'phoneNumber']
    const values = Object.fromEntries(fields.map(key => [key, String(form.get(key) || '').trim()]))
    values.phoneNumber = values.phoneNumber.replace(/[\s()-]/g, '')
    try {
      const response = await fetch('/api/customer/addresses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...(address ? { addressId: address.id } : {}), address: { ...values, territoryCode: country }, ...(form.has('defaultAddress') ? { defaultAddress: true } : {}) }) })
      if (response.status === 401) { setError('expired'); return }
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error('Save failed')
      onSaved()
    } catch { setError('save') } finally { setSaving(false) }
  }
  const fields = [
    ['firstName', ar ? 'الاسم الأول' : 'First name', 'given-name', true], ['lastName', ar ? 'اسم العائلة (اختياري)' : 'Last name (optional)', 'family-name', false],
    ['company', ar ? 'الشركة (اختياري)' : 'Company (optional)', 'organization', false], ['address1', ar ? 'المبنى والشارع' : 'Building and street', 'address-line1', true],
    ['address2', ar ? 'الشقة / تفاصيل إضافية (اختياري)' : 'Apartment / additional details (optional)', 'address-line2', false], ['city', ar ? 'المدينة / المنطقة' : 'City / area', 'address-level2', true],
    ['zip', ar ? 'الرمز البريدي (اختياري)' : 'Postal code (optional)', 'postal-code', false], ['phoneNumber', ar ? 'رقم التواصل مع رمز الدولة (مطلوب)' : 'Contact number with country code (required)', 'tel', true],
  ] as const
  return <form onSubmit={save} className="space-y-5 rounded-xl border border-atp-gold bg-neutral-900 p-5">
    <h2 className="text-xl font-semibold">{address ? (ar ? 'تعديل العنوان' : 'Edit address') : (ar ? 'عنوان جديد' : 'New address')}</h2>
    <fieldset disabled={saving} className="grid gap-4 sm:grid-cols-2">
      {fields.map(([key, label, autoComplete, required]) => <div key={key} className="space-y-2"><Label htmlFor={`address-${key}`}>{label}</Label><Input id={`address-${key}`} name={key} autoComplete={autoComplete} defaultValue={address?.[key] || ''} required={required} maxLength={key === 'phoneNumber' ? 30 : key === 'firstName' || key === 'city' ? 100 : 255} type={key === 'phoneNumber' ? 'tel' : 'text'} dir={key === 'phoneNumber' ? 'ltr' : undefined} placeholder={key === 'phoneNumber' ? '+971501234567' : undefined} aria-describedby={key === 'phoneNumber' ? 'address-phone-help' : undefined} pattern={key === 'phoneNumber' ? String.raw`\+[1-9][0-9\s\(\)\-]{6,24}` : undefined} />{key === 'phoneNumber' && <p id="address-phone-help" className="text-sm leading-relaxed text-neutral-300">{ar ? 'نحتاج الرقم ليتواصل معك مندوب التوصيل. مثال: +971501234567' : 'Required so the delivery driver can contact you. Example: +971501234567'}</p>}</div>)}
      <div className="space-y-2"><Label htmlFor="address-zone">{ar ? 'الإمارة / المنطقة' : 'Emirate / region'}</Label>{country === 'AE' ? <select id="address-zone" name="zoneCode" required defaultValue={address?.zoneCode || ''} className="h-12 w-full rounded-md border border-neutral-600 bg-neutral-900 px-3"><option value="">{ar ? 'اختر الإمارة' : 'Choose an emirate'}</option>{emirates.map(([code, arabic, english]) => <option key={code} value={code}>{ar ? arabic : english}</option>)}</select> : <Input id="address-zone" name="zoneCode" defaultValue={address?.zoneCode || ''} />}</div>
      <div><p className="text-sm">{ar ? 'الدولة' : 'Country'}</p><p>{country === 'AE' ? (ar ? 'الإمارات العربية المتحدة' : 'United Arab Emirates') : address?.country || country}</p></div>
      <label className="flex items-center gap-3 sm:col-span-2"><input type="checkbox" name="defaultAddress" defaultChecked={isDefault} disabled={isDefault} />{ar ? 'استخدامه كعنوان افتراضي' : 'Use as default address'}</label>
      <Button type="submit" className="bg-atp-gold text-black hover:bg-atp-gold/90">{saving ? (ar ? 'جارٍ الحفظ…' : 'Saving…') : (ar ? 'حفظ العنوان' : 'Save address')}</Button><Button type="button" variant="outline" onClick={onCancel}>{ar ? 'إلغاء' : 'Cancel'}</Button>
    </fieldset>
    {error && <p role="alert" className="text-red-300">{error === 'expired' ? (ar ? 'انتهت الجلسة. سجّل الدخول مجددًا.' : 'Session expired. Sign in again.') : (ar ? 'تعذر حفظ العنوان. راجع البيانات ورقم التواصل مع رمز الدولة ثم حاول مجددًا.' : 'Unable to save. Check the address and contact number including country code, then try again.')}</p>}
  </form>
}
