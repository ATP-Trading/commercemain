'use client'

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/src/i18n/navigation'

/** Deadline includes an explicit timezone; stale cached pages also hide on expiry. */
export function PromotionBanner({ expiresAt, deadlineLabelAr, deadlineLabelEn }: {
  expiresAt: string
  deadlineLabelAr: string
  deadlineLabelEn: string
}) {
  const ar = useLocale() === 'ar'
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const end = Date.parse(expiresAt)
    let timer: ReturnType<typeof setTimeout> | undefined
    const update = () => {
      clearTimeout(timer)
      const remaining = end - Date.now()
      setVisible(Number.isFinite(remaining) && remaining > 0)
      if (remaining > 0) timer = setTimeout(update, Math.min(remaining, 60_000))
    }
    update()
    document.addEventListener('visibilitychange', update)
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', update) }
  }, [expiresAt])
  if (!visible) return null
  return <aside aria-label={ar ? 'عرض لفترة محدودة' : 'Limited-time offer'} className="bg-atp-gold px-4 py-3 text-center text-black">
    <Link href="/collections/amazing-thai-products" className="mx-auto flex min-h-11 max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm leading-relaxed sm:text-base">
      <strong>{ar ? 'خصم ٢٠٪ على جميع منتجات الصحة والعناية' : '20% off all health & personal care products'}</strong>
      <span>{ar ? deadlineLabelAr : deadlineLabelEn}</span>
      <span className="font-semibold underline underline-offset-4">{ar ? 'تسوق العرض' : 'Shop the offer'}</span>
    </Link>
  </aside>
}
