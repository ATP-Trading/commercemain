/** Shared title layout for homepage and collection product cards. */
export function ProductCardHeading({ title }: { title: string }) {
  const [name, subtitle] = title.match(/^(.*?)\s+[–—-]\s+(.+)$/)?.slice(1) || [title]
  return <div className="space-y-2">
    <h3 dir="auto" className="break-words text-center text-base font-semibold leading-snug text-neutral-900">{name}</h3>
    {subtitle && <p dir="auto" className="text-sm font-normal leading-relaxed text-neutral-600">{subtitle}</p>}
  </div>
}
