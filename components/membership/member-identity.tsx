'use client'

import { Crown, User } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useMembership } from '@/hooks/use-membership'

export function MemberAccountIcon({ className = 'h-5 w-5' }: { className?: string }) {
  const { isMember, isLoading } = useMembership()
  const ar = useLocale() === 'ar'
  const active = isMember && !isLoading
  return <span className={active ? 'relative inline-flex rounded-full p-1 text-atp-gold ring-1 ring-atp-gold/70' : 'inline-flex'}>
    <User aria-hidden="true" className={className} />
    {active && <><Crown aria-hidden="true" className="absolute -end-1 -top-2 h-3 w-3 rounded-sm bg-black text-atp-gold" /><span className="sr-only">{ar ? 'عضو ATP' : 'ATP member'}</span></>}
  </span>
}

export function MemberIdentityCard({ name }: { name: string }) {
  const { membership, isMember, isLoading } = useMembership()
  const ar = useLocale() === 'ar'
  if (!isMember || isLoading) return null
  const expiry = membership.expiresAt ? new Date(membership.expiresAt) : null
  const validExpiry = expiry && Number.isFinite(expiry.getTime()) ? expiry : null
  return <section aria-label={ar ? 'بطاقة عضويتك' : 'Your membership card'} className="relative overflow-hidden rounded-2xl border border-atp-gold/60 bg-gradient-to-br from-neutral-900 via-neutral-950 to-yellow-950/40 p-6 shadow-lg sm:p-8">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <span className="inline-flex items-center gap-2 rounded-full border border-atp-gold/50 px-3 py-1 text-sm font-semibold tracking-wider text-atp-gold" dir="ltr"><Crown aria-hidden="true" className="h-4 w-4" />ATP MEMBER</span>
      <span className="text-sm text-atp-gold">{ar ? 'عضوية فعّالة' : 'Active membership'}</span>
    </div>
    <p className="mt-6 break-words text-2xl font-semibold text-white">{name}</p>
    <p className="mt-2 text-sm text-neutral-300">{ar ? 'مرحبًا بك في عضوية ATP' : 'Welcome to ATP membership'}</p>
    {validExpiry && <p className="mt-5 text-sm text-neutral-300">{ar ? 'صالحة حتى: ' : 'Valid until: '}<time dateTime={validExpiry.toISOString()}>{new Intl.DateTimeFormat(ar ? 'ar-AE' : 'en-AE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Dubai' }).format(validExpiry)}</time></p>}
  </section>
}
