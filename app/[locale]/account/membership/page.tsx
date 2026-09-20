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
 const { membership, isMember, isLoading, error } = useMembership()
 const formatDate = (value?: string) => value && Number.isFinite(Date.parse(value))
  ? new Intl.DateTimeFormat(ar ? 'ar-AE' : 'en-AE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Dubai' }).format(new Date(value)) : null
 const granted = membership.source === 'merchant' || membership.merchantGranted === true
 const started = formatDate(membership?.startedAt)
 const renewal = formatDate(membership?.nextBillingDate)
 return <section className="space-y-4 rounded-xl border border-neutral-700 bg-neutral-900 p-6">
  {isLoading ? <p role="status">{ar ? 'جارٍ التحقق من العضوية…' : 'Checking membership…'}</p> : error ? <p role="alert">{ar ? 'تعذر التحقق من حالة عضويتك حاليًا. يمكنك الاطلاع على المزايا والسعر أدناه.' : 'Your membership status is currently unavailable. You can still view benefits and pricing below.'}</p> : <p>{isMember ? (ar ? 'عضويتك في ATP فعّالة.' : 'Your ATP membership is active.') : (ar ? 'لا توجد عضوية فعّالة مرتبطة بحسابك حاليًا.' : 'There is no active membership associated with your account.')}</p>}
  {isMember && granted && <p className="text-atp-gold">{ar ? 'عضوية ممنوحة لك من ATP Trading.' : 'Membership granted to you by ATP Trading.'}</p>}
  {isMember && !granted && membership.source === 'appstle' && <div className="space-y-5">
   <h2 className="text-xl font-semibold text-atp-gold">{ar ? 'اشتراكك السنوي' : 'Your annual subscription'}</h2>
   <dl className="grid gap-4 rounded-lg border border-neutral-700 p-4 sm:grid-cols-2">
    <div><dt className="text-neutral-400">{ar ? 'الحالة' : 'Status'}</dt><dd className="mt-1 font-medium">{ar ? 'فعّالة' : 'Active'}</dd></div>
    {started && <div><dt className="text-neutral-400">{ar ? 'تاريخ بدء العضوية' : 'Member since'}</dt><dd className="mt-1 font-medium">{started}</dd></div>}
    <div><dt className="text-neutral-400">{ar ? 'موعد التجديد القادم' : 'Next renewal'}</dt><dd className="mt-1 font-medium">{renewal || (ar ? 'غير متاح حاليًا — راجع بوابة العضوية' : 'Currently unavailable — check your membership portal')}</dd></div>
   </dl>
   <Button asChild className="min-h-12 w-full bg-atp-gold px-6 text-base font-semibold text-black hover:bg-atp-gold/90 sm:w-auto"><a href={`https://checkout.atpgroupservices.ae/customer_authentication/login?return_to=%2Fapps%2Fmemberships&locale=${ar ? 'ar' : 'en'}&ui_hint=full&region_country=AE`}>{ar ? 'إدارة اشتراكي' : 'Manage my subscription'}</a></Button>
   <p className="text-neutral-300">{ar ? 'راجع التجديد ووسيلة الدفع أو خيارات الإلغاء في بوابة العضوية. قد يُطلب منك تسجيل الدخول بالبريد الذي اشتركت به.' : 'Review renewal, payment details or cancellation options in the membership portal. You may be asked to sign in with the email used for your subscription.'}</p>
   <details className="rounded-lg border border-neutral-600 p-4">
    <summary className="min-h-12 cursor-pointer py-3 text-base font-semibold text-atp-gold">{ar ? 'مساعدة في الوصول إلى اشتراكي' : 'Help accessing my subscription'}</summary>
    <div className="mt-3 space-y-3 text-neutral-300">
     <p>{ar ? 'افتح رسالة تأكيد العضوية التي وصلتك على بريدك، ثم اضغط رابط إدارة العضوية لعرض تفاصيل التجديد وتحديث وسيلة الدفع أو إلغاء الاشتراك.' : 'Open your membership confirmation email and follow the manage membership link to view renewal details, update your payment method or cancel your subscription.'}</p>
     <p>{ar ? 'إذا انتهت صلاحية الرابط أو لم تجد الرسالة، تواصل معنا لمساعدتك في الوصول إلى عضويتك.' : 'If the link has expired or you cannot find the email, contact us for help accessing your membership.'}</p>
     <Link href="/contact" className="inline-flex min-h-12 items-center text-atp-gold underline">{ar ? 'مساعدة في إدارة العضوية' : 'Membership management help'}</Link>
    </div>
   </details>
  </div>}
  {isMember && granted && membership.source === 'appstle' && <p className="text-neutral-300">{ar ? 'يوجد أيضًا سجل اشتراك نشط في Appstle. المنحة لا تلغي هذا السجل؛ تواصل معنا للتأكد من إعدادات التجديد.' : 'Appstle also has an active subscription record. Your grant does not cancel that record; contact us to confirm its renewal settings.'}</p>}
  {isMember && <div className="space-y-2 border-t border-neutral-700 pt-4"><h2 className="text-lg font-semibold">{ar ? 'مزاياك' : 'Your benefits'}</h2><ul className="list-inside list-disc space-y-2 text-neutral-300"><li>{ar ? 'خصم ١٥٪ على المنتجات المؤهلة من المكملات والعناية الشخصية.' : '15% off eligible supplements and personal care products.'}</li><li>{ar ? 'خصم ١٠٪ على منتجات المياه والتربة.' : '10% off water and soil products.'}</li><li>{ar ? 'توصيل مجاني داخل الإمارات دون حد أدنى للطلب.' : 'Free UAE delivery with no minimum order.'}</li></ul></div>}
  <p className="text-neutral-300">{isMember ? (ar ? 'استمتع بمزايا عضويتك. يمكنك الاطلاع على التفاصيل والشروط أدناه.' : 'Enjoy your membership benefits. View the details and terms below.') : ar ? 'تعرّف على مزايا عضوية ATP وسعرها وشروطها، واشترك من صفحة العضوية إذا ناسبتك.' : 'Explore ATP membership benefits, pricing and terms, and join from the membership page if it suits you.'}</p>
  <Button asChild className="min-h-12 w-full bg-atp-gold px-6 text-base font-semibold text-black hover:bg-atp-gold/90 sm:w-auto"><Link href="/product/atp-membership">{isMember ? (ar ? 'عرض مزايا العضوية' : 'View membership benefits') : (ar ? 'عرض العضوية والاشتراك' : 'View membership and join')}</Link></Button>
  <Link href="/contact" className="block text-atp-gold underline">{ar ? 'تواصل معنا بخصوص عضويتك' : 'Contact us about your membership'}</Link>
 </section>
}
