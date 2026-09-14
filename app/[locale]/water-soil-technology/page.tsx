import { permanentRedirect } from 'next/navigation';

// Keep old campaign links working while consolidating the catalog on one page.
export default async function WaterSoilTechnologyPage({ params }: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  permanentRedirect(`/${locale}/collections/water-soil-technology-solutions`);
}
