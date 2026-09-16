import { permanentRedirect } from 'next/navigation'
import { defaultLocale } from '@/lib/i18n/config'

export default function RootPage() {
  // This should never be reached due to middleware redirect
  // But as a fallback, redirect to default locale
  permanentRedirect(`/${defaultLocale}`)
}
