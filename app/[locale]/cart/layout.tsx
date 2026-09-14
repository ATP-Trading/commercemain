import type { Metadata } from 'next'

interface CartLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  const isArabic = locale === 'ar'
  
  const title = isArabic 
    ? 'سلة التسوق | ATP Trading'
    : 'Shopping Cart | ATP Trading'
  
  const description = isArabic
    ? 'راجع سلة التسوق الخاصة بك وتابع إلى الدفع. استمتع بخصومات الأعضاء الحصرية والتوصيل المجاني.'
    : 'Review your shopping cart and proceed to checkout. Enjoy exclusive member discounts and free delivery.'

  return {
    title: { absolute: title },
    description,
    robots: {
      index: false, // Don't index cart pages
      follow: true,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: isArabic ? 'ar_AE' : 'en_AE',
    },
  }
}

export default function CartLayout({ children }: CartLayoutProps) {
  return <>{children}</>
}
