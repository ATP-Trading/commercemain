'use client'
import { useLocale } from 'next-intl'
import { Link } from '@/src/i18n/navigation'
import { AccountShell } from './account-shell'
export function AccountDashboard() {
  const ar = useLocale() === 'ar'
  return <AccountShell title={ar ? 'حسابي' : 'My account'} path="/account"><p className="text-neutral-300">{ar ? 'طلباتك وبياناتك في مكان واحد. تُحفظ التغييرات في حسابك لتجدها عند زيارتك القادمة.' : 'Your orders and details in one place. Changes are saved to your account for your next visit.'}</p><div className="grid gap-4 sm:grid-cols-2">{[
    ['/account/orders', ar ? 'طلباتي السابقة' : 'Order history', ar ? 'عرض الطلبات وتفاصيلها ومتابعة حالتها.' : 'View your purchases, order details and status.'],
    ['/account/profile', ar ? 'بياناتي الشخصية' : 'Personal details', ar ? 'عرض بريدك الإلكتروني وتعديل اسمك.' : 'View your email and update your name.'],
    ['/account/addresses', ar ? 'العناوين وأرقام التواصل' : 'Addresses and contact numbers', ar ? 'إضافة عنوان أو تعديله وتحديد عنوانك الافتراضي.' : 'Add or edit an address and choose your default.'],
    ['/account/membership', ar ? 'عضوية ATP' : 'ATP membership', ar ? 'الاطلاع على معلومات العضوية.' : 'View membership information.'],
  ].map(([href, title, description]) => <Link key={href} href={href} className="rounded-xl border border-neutral-700 bg-neutral-900 p-6 hover:border-atp-gold"><h2 className="mb-2 text-xl font-semibold text-atp-gold">{title}</h2><p className="text-neutral-300">{description}</p></Link>)}</div></AccountShell>
}
