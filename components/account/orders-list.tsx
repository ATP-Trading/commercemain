'use client'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Link } from '@/src/i18n/navigation'
import { useAccountList } from '@/hooks/use-account-list'
import { AccountShell } from './account-shell'
type Order = { id: string; name: string; processedAt: string; financialStatus: string | null; fulfillmentStatus: string; cancelledAt: string | null; statusPageUrl: string; totalPrice: { amount: string; currencyCode: string }; lineItems: { nodes: { title: string; quantity: number }[]; pageInfo: { hasNextPage: boolean } } }
const statuses: Record<string, [string, string]> = { PAID: ['مدفوع', 'Paid'], PENDING: ['بانتظار الدفع', 'Payment pending'], AUTHORIZED: ['الدفع معتمد', 'Payment authorized'], PARTIALLY_PAID: ['مدفوع جزئيًا', 'Partially paid'], REFUNDED: ['مسترد', 'Refunded'], PARTIALLY_REFUNDED: ['مسترد جزئيًا', 'Partially refunded'], VOIDED: ['الدفع ملغى', 'Payment voided'], EXPIRED: ['انتهت صلاحية الدفع', 'Payment expired'], FULFILLED: ['تم تنفيذ الطلب', 'Fulfilled'], UNFULFILLED: ['قيد التجهيز', 'Unfulfilled'], PARTIALLY_FULFILLED: ['تم تنفيذ جزء من الطلب', 'Partially fulfilled'], IN_PROGRESS: ['قيد التنفيذ', 'In progress'], ON_HOLD: ['معلّق', 'On hold'], RESTOCKED: ['أُعيد للمخزون', 'Restocked'], SCHEDULED: ['مجدول', 'Scheduled'] }
export function OrdersPageContent() { const ar = useLocale() === 'ar'; return <AccountShell title={ar ? 'طلباتي' : 'My orders'} path="/account/orders"><OrdersList /></AccountShell> }
export function OrdersList() {
  const locale = useLocale(), ar = locale === 'ar'
  const { items, loading, error, expired, page, load } = useAccountList<Order>('/api/customer/orders')
  const status = (value: string | null) => value && statuses[value] ? statuses[value][ar ? 0 : 1] : ar ? 'راجع تفاصيل الطلب' : 'See order details'
  return <section className="space-y-4">
    <p className="text-neutral-300">{ar ? 'تظهر هنا الطلبات المرتبطة بالبريد الإلكتروني الذي سجّلت الدخول به، من الأحدث إلى الأقدم.' : 'Orders associated with your sign-in email appear here, newest first.'}</p>
    {items.map(order => <article key={order.id} className="space-y-4 rounded-xl border border-neutral-700 bg-neutral-900 p-5">
      <div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-xl font-semibold" dir="ltr">{order.name}</h2><p className="text-sm text-neutral-300">{new Date(order.processedAt).toLocaleDateString(ar ? 'ar-AE' : 'en-AE', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div><p className="font-semibold">{new Intl.NumberFormat(ar ? 'ar-AE' : 'en-AE', { style: 'currency', currency: order.totalPrice.currencyCode }).format(Number(order.totalPrice.amount))}</p></div>
      <div className="flex flex-wrap gap-2 text-sm">{[order.cancelledAt ? (ar ? 'طلب ملغى' : 'Cancelled') : status(order.fulfillmentStatus), status(order.financialStatus)].map((label, i) => <span key={i} className="rounded-full bg-neutral-800 px-3 py-1">{label}</span>)}</div>
      <ul className="space-y-2 text-neutral-300">{order.lineItems.nodes.map((item, i) => <li key={i}>{item.title} × {item.quantity}</li>)}</ul>
      {order.lineItems.pageInfo.hasNextPage && <p className="text-sm">{ar ? 'بقية المنتجات في تفاصيل الطلب.' : 'More items in order details.'}</p>}
      {order.statusPageUrl.startsWith('https://') && <Button asChild className="w-full sm:w-auto"><a href={order.statusPageUrl}>{ar ? 'تفاصيل الطلب ومتابعته' : 'Order details and tracking'}</a></Button>}
    </article>)}
    {loading && <p role="status">{ar ? 'جارٍ تحميل الطلبات…' : 'Loading orders…'}</p>}
    {expired ? <p role="alert"><Link href="/login">{ar ? 'انتهت الجلسة. سجّل الدخول مجددًا.' : 'Session expired. Sign in again.'}</Link></p> : error ? <div role="alert"><p>{ar ? 'تعذر تحميل الطلبات. بياناتك لم تتغير.' : 'Unable to load orders. Your data is unchanged.'}</p><Button onClick={() => void load(items.length ? page.endCursor : null)}>{ar ? 'حاول مرة أخرى' : 'Try again'}</Button></div> : !loading && !items.length ? <div className="space-y-4 rounded-xl border border-neutral-700 p-6"><p>{ar ? 'ما عندك طلبات سابقة بهذا الحساب حتى الآن.' : 'No orders for this account yet.'}</p><Button asChild><Link href="/">{ar ? 'ابدأ التسوق' : 'Start shopping'}</Link></Button></div> : null}
    {page.hasNextPage && !expired && !error && <Button disabled={loading} onClick={() => void load(page.endCursor)}>{ar ? 'عرض طلبات أقدم' : 'Load older orders'}</Button>}
  </section>
}
