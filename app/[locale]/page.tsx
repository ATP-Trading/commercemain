import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { NewArrivalsWrapper } from "@/components/new-arrivals-wrapper";
import { StructuredData } from "@/components/structured-data";
import ATPWellnessHero from "@/components/hero/atp-wellness-hero";
import ServiceHighlights from "@/components/sections/service-highlights";
import TrustIndicators from "@/components/sections/trust-indicators";
import { InstagramFeed } from "@/components/sections/instagram-feed";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === "ar" ? "ar" : "en") as "en" | "ar";
  const isAr = locale === "ar";

  return {
    title: { absolute: isAr
      ? "ATP Trading | العافية والتكنولوجيا في الإمارات"
      : "ATP Trading | Premium Wellness & Technology UAE" },
    description: isAr
      ? "اكتشف حلول العافية المتميزة - العناية بالبشرة، المكملات الغذائية، تقنية المياه. منتجات متاحة داخل الإمارات."
      : "Discover premium wellness solutions - Skincare, Supplements, Water Technology. Available within the UAE.",
    keywords: isAr
      ? ["عافية", "بشرة", "مكملات", "مياه قلوية", "دبي", "الإمارات", "عناية بالبشرة"]
      : ["wellness", "skincare", "supplements", "alkaline water", "Dubai", "UAE", "fitness", "health"],
    alternates: {
      canonical: `https://www.atpgroupservices.ae/${locale}`,
      languages: {
        'en': 'https://www.atpgroupservices.ae/en',
        'ar': 'https://www.atpgroupservices.ae/ar',
      },
    },
    openGraph: {
      title: isAr ? "ATP Trading" : "ATP Trading",
      description: isAr
        ? "حلول العافية المتميزة والتكنولوجيا المتقدمة في الإمارات"
        : "Premium wellness and technology solutions in UAE",
      url: `https://www.atpgroupservices.ae/${locale}`,
      type: 'website',
      siteName: isAr ? "ATP Trading" : "ATP Trading",
      locale: isAr ? 'ar_AE' : 'en_AE',
      images: [{
        url: 'https://www.atpgroupservices.ae/images/atp-logo.png',
        width: 1200,
        height: 630,
        alt: isAr ? "ATP Trading" : "ATP Trading",
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isAr ? "ATP Trading" : "ATP Trading",
      description: isAr
        ? "حلول العافية المتميزة والتكنولوجيا المتقدمة"
        : "Premium wellness and technology solutions",
      images: ['https://www.atpgroupservices.ae/images/atp-logo.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === "ar" ? "ar" : "en") as "en" | "ar";
  
  // Enable static rendering
  setRequestLocale(locale);
  
  const t = await getTranslations('common');

  return (
    <>
      <StructuredData
        type="WebSite"
        data={{
          name: "ATP Trading",
          url: `https://www.atpgroupservices.ae/${locale}`,
          description: t('siteDescription'),
        }}
      />

      {/* Enhanced ATP Wellness Hero Section */}
      <ATPWellnessHero />

      {/* New Arrivals and Products */}
      <NewArrivalsWrapper locale={locale} />

      {/* Interactive Service Highlights */}
      <ServiceHighlights />

      {/* Instagram Feed */}
      <InstagramFeed limit={8} />

      {/* Trust Indicators */}
      <TrustIndicators locale={locale} />
    </>
  );
}
