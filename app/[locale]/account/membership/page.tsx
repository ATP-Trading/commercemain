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
  {isLoading ? <p role="status">{ar ? 'جارٍ التحقق من العضوية…' : 'Checking membership…'}</p> : error ? <p role="alert">{ar ? 'تعذر التحقق من العضوية حاليًا. حاول لاحقًا أو تواصل معنا.' : 'Membership status is currently unavailable. Try later or contact us.'}</p> : <p>{isMember ? (ar ? 'عضويتك في ATP فعّالة.' : 'Your ATP membership is active.') : (ar ? 'لا توجد عضوية فعّالة مرتبطة بحسابك حاليًا.' : 'There is no active membership associated with your account.')}</p>}
  {!isLoading && !error && !isMember && <Button asChild><Link href="/product/atp-membership">{ar ? 'تفاصيل العضوية' : 'Membership details'}</Link></Button>}
  <Link href="/contact" className="block text-atp-gold underline">{ar ? 'تواصل معنا بخصوص عضويتك' : 'Contact us about your membership'}</Link>
 </section>
}
