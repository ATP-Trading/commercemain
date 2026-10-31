import Price from '@/components/price'

/** Show the original only when an eligible member receives a lower price. */
export function MemberPrice({ original, amount, currencyCode, member, ar, className = 'text-base' }: {
  original: string; amount: string; currencyCode: string; member: boolean; ar: boolean; className?: string
}) {
  const discounted = member && Number.isFinite(Number(amount)) && Number(amount) < Number(original)
  return <div className="flex flex-wrap items-center gap-x-3 gap-y-1" aria-live="polite">
    {discounted && <div className="text-sm text-neutral-500">
      <span className="sr-only">{ar ? 'السعر الأصلي' : 'Original price'}</span>
      <del><Price amount={original} currencyCode={currencyCode} className="inline-flex line-through font-normal" /></del>
    </div>}
    <div className="flex flex-wrap items-center gap-2">
      <Price amount={amount} currencyCode={currencyCode} className={`${className} font-semibold`} />
      {discounted && <span className="rounded-md border border-atp-gold/40 bg-atp-gold/10 px-2 py-1 text-xs font-medium text-neutral-800">{ar ? 'سعر الأعضاء' : 'Member price'}</span>}
    </div>
  </div>
}
