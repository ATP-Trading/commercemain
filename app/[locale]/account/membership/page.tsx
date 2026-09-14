'use client'
import { useLocale } from 'next-intl'
import { useMembership } from '@/hooks/use-membership'
import { AccountShell } from '@/components/account/account-shell'
import { Link } from '@/src/i18n/navigation'
import { Button } from '@/components/ui/button'
export default function MembershipAccountPage() {
 const ar = useLocale() === 'ar'
 return <AccountShell title={ar ? 'عضوية ATP' : 'ATP membership'} path="/account/membership"><MembershipStatus /></AccountShell>
}
function MembershipStatus() {
 const ar = useLocale() === 'ar'
 const { isMember, isLoading, error } = useMembership()
 return <section className="space-y-4 rounded-xl border border-neutral-700 bg-neutral-900 p-6">
  {isLoading ? <p role="status">{ar ? 'جارٍ التحقق من العضوية…' : 'Checking membership…'}</p> : error ? <p role="alert">{ar ? 'تعذر التحقق من حالة عضويتك حاليًا. يمكنك الاطلاع على المزايا والسعر أدناه.' : 'Your membership status is currently unavailable. You can still view benefits and pricing below.'}</p> : <p>{isMember ? (ar ? 'عضويتك في ATP فعّالة.' : 'Your ATP membership is active.') : (ar ? 'لا توجد عضوية فعّالة مرتبطة بحسابك حاليًا.' : 'There is no active membership associated with your account.')}</p>}
  <p className="text-neutral-300">{ar ? 'تعرّف على مزايا عضوية ATP وسعرها وشروطها، واشترك من صفحة العضوية إذا ناسبتك.' : 'Explore ATP membership benefits, pricing and terms, and join from the membership page if it suits you.'}</p>
  <Button asChild className="min-h-12 w-full bg-atp-gold px-6 text-base font-semibold text-black hover:bg-atp-gold/90 sm:w-auto"><Link href="/product/atp-membership">{isMember ? (ar ? 'عرض مزايا العضوية' : 'View membership benefits') : (ar ? 'عرض العضوية والاشتراك' : 'View membership and join')}</Link></Button>
  <Link href="/contact" className="block text-atp-gold underline">{ar ? 'تواصل معنا بخصوص عضويتك' : 'Contact us about your membership'}</Link>
 </section>
}
