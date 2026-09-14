'use client'
import { useLocale } from 'next-intl'
import { Link } from '@/src/i18n/navigation'
import { Button } from '@/components/ui/button'
export default function AccountError({ reset }: { reset: () => void }) {
 const ar = useLocale() === 'ar'
 return <main dir={ar ? 'rtl' : 'ltr'} className="min-h-screen bg-neutral-950 px-4 py-10 text-white"><div role="alert" className="mx-auto max-w-xl space-y-5"><h1 className="text-2xl font-semibold">{ar ? 'تعذر عرض هذه الصفحة' : 'Unable to display this page'}</h1><p className="text-base leading-relaxed">{ar ? 'حاول تحميل الصفحة مجددًا، أو ارجع إلى حسابك لاختيار قسم آخر.' : 'Try loading this page again, or return to your account to choose another section.'}</p><Button onClick={reset} className="min-h-12 bg-atp-gold text-base text-black hover:bg-atp-gold/90">{ar ? 'إعادة المحاولة' : 'Try again'}</Button><Link href="/account" className="block py-3 text-base text-atp-gold underline">{ar ? 'العودة إلى حسابي' : 'Back to my account'}</Link></div></main>
}
