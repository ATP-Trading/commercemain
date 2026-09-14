import { PaymentGuidance } from '@/components/account/payment-guidance'
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
 const { locale } = await params
 return { title: { absolute: `${locale === 'ar' ? 'الدفع' : 'Payment'} | ATP Trading` } }
}
export default function Page() { return <PaymentGuidance /> }
