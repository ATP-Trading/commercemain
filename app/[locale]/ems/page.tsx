import { InactiveServicePage, inactiveServiceMetadata } from "@/components/inactive-service-page";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return inactiveServiceMetadata(locale, '/ems');
}
export default async function EMSPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <InactiveServicePage locale={locale} />;
}
