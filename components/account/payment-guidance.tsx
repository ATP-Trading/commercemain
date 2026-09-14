'use client'
import { useLocale } from 'next-intl'
import { Link } from '@/src/i18n/navigation'
import { Button } from '@/components/ui/button'
import { AccountShell } from './account-shell'
export function PaymentGuidance() {
 const ar = useLocale() === 'ar'
 return <AccountShell title={ar ? 'الدفع' : 'Payment'} path="/account/payment-methods"><section className="max-w-2xl space-y-5 rounded-xl border border-neutral-700 bg-neutral-900 p-5 sm:p-6">
  <h2 className="text-xl font-semibold">{ar ? 'اختيار وسيلة الدفع عند إتمام الطلب' : 'Choose your payment method at checkout'}</h2>
  <p className="text-neutral-300">{ar ? 'أضف المنتجات إلى السلة، ثم انتقل إلى إتمام الطلب. ستظهر وسائل الدفع المتاحة لتختار منها وتدخل بيانات الدفع هناك.' : 'Add products to your cart and continue to checkout. Available payment methods will appear there so you can choose one and enter your payment details.'}</p>
  <p className="text-neutral-300">{ar ? 'حفظ بطاقة جديدة غير متاح من هذه الصفحة. يمكنك متابعة التسوق وإتمام طلبك دون تسجيل بطاقة في البروفايل.' : 'Adding a saved card is not available on this page. You can shop and complete your order without registering a card in your profile.'}</p>
  <div className="flex flex-col gap-3 sm:flex-row"><Button asChild className="min-h-12 bg-atp-gold text-base text-black hover:bg-atp-gold/90"><Link href="/cart">{ar ? 'عرض السلة' : 'View cart'}</Link></Button><Button asChild variant="outline" className="min-h-12 border-neutral-600 bg-neutral-900 text-base text-white hover:bg-neutral-800 hover:text-white"><Link href="/">{ar ? 'متابعة التسوق' : 'Continue shopping'}</Link></Button></div>
 </section></AccountShell>
}
