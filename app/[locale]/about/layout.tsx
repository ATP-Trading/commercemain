import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

interface AboutLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'common' })

  const isArabic = locale === 'ar'
  
  const title = isArabic 
    ? 'عن ATP Trading | حلول العافية المتميزة'
    : 'About ATP Trading | Premium Wellness Solutions'
  
  const description = isArabic
    ? 'اكتشف مهمتنا في تقديم حلول العافية المبتكرة التي تغذي العقل والجسم والروح من خلال تجارب متميزة وتقنية متطورة.'
    : 'Discover our mission to deliver innovative wellness solutions that nurture the mind, body, and spirit through premium experiences and cutting-edge technology.'

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: isArabic ? 'ar_AE' : 'en_AE',
      url: `https://www.atpgroupservices.ae/${locale}/about`,
      siteName: isArabic ? 'ATP Trading' : 'ATP Trading',
      images: [{
        url: 'https://www.atpgroupservices.ae/og-about.jpg',
        width: 1200,
        height: 630,
        alt: title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://www.atpgroupservices.ae/og-about.jpg'],
    },
    alternates: {
      canonical: `https://www.atpgroupservices.ae/${locale}/about`,
      languages: {
        en: 'https://www.atpgroupservices.ae/en/about',
        ar: 'https://www.atpgroupservices.ae/ar/about',
      },
    },
  }
}

export default function AboutLayout({ children }: AboutLayoutProps) {
  return <>{children}</>
}
