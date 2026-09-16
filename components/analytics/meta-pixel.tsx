'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { MARKETING_CONSENT_EVENT, trackMetaPage } from '@/lib/analytics/meta'

declare global {
  interface Window { fbq: any; _fbq: any }
}

// Storefront page views only. Shopify owns checkout and purchase events.
export function MetaPixel() {
  const pathname = usePathname()
  useEffect(() => {
    trackMetaPage()
    window.addEventListener(MARKETING_CONSENT_EVENT, trackMetaPage)
    return () => window.removeEventListener(MARKETING_CONSENT_EVENT, trackMetaPage)
  }, [pathname])
  return null
}
