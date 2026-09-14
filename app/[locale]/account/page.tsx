import { AccountDashboard } from '@/components/account/account-dashboard'
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
 const { locale } = await params
 return { title: { absolute: `${locale === 'ar' ? 'حسابي' : 'My account'} | ATP Trading` }, robots: { index: false, follow: false } }
}
export default function AccountPage() { return <AccountDashboard /> }
