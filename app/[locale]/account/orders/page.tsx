import { OrdersPageContent } from '@/components/account/orders-list'
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
 const { locale } = await params
 return { title: { absolute: `${locale === 'ar' ? 'طلباتي' : 'My orders'} | ATP Trading` }, robots: { index: false, follow: false } }
}
export default function Page() { return <OrdersPageContent /> }
