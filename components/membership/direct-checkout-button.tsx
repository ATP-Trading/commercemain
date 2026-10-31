'use client'

import { useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { startMembershipCheckout } from './direct-checkout-actions'

export function MembershipCheckoutButton() {
  const ar = useLocale() === 'ar'
  const busy = useRef(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false)
  async function purchase() {
    if (busy.current) return
    busy.current = true
    setPending(true)
    setError(false)
    try {
      const result = await startMembershipCheckout()
      if (result.url || result.login) window.location.assign(result.url || result.login!)
      else throw new Error('Checkout unavailable')
    } catch {
      setError(true)
      busy.current = false
      setPending(false)
    }
  }
  return <div>
    <Button onClick={purchase} disabled={pending} className="w-full min-h-12 bg-atp-gold text-atp-black hover:bg-atp-gold/90 font-semibold">
      {pending ? (ar ? 'جارٍ المتابعة…' : 'Continuing…') : (ar ? 'شراء العضوية الآن' : 'Buy membership now')}
    </Button>
    <p className="mt-2 text-center text-sm text-neutral-600">{ar ? 'سجّل الدخول ببريدك لربط العضوية بحسابك، ثم أكمل الدفع.' : 'Sign in with your email to link membership to your account, then complete payment.'}</p>
    {error && <p role="alert" className="mt-2 text-sm text-red-600">{ar ? 'تعذّر تأكيد حسابك أو تجهيز الدفع. حاول مرة أخرى.' : 'We could not verify your account or prepare checkout. Please try again.'}</p>}
  </div>
}
