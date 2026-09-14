import { AddressesPageContent } from '@/components/account/addresses-manager'
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
 const { locale } = await params
 return { title: { absolute: `${locale === 'ar' ? 'عناويني' : 'My addresses'} | ATP Trading` }, robots: { index: false, follow: false } }
}
export default function Page() { return <AddressesPageContent /> }
