'use client'
import { useState } from 'react'
import Image from 'next/image'
interface CollectionHeroProps { title: string; subtitle?: string; description?: string; image: { src: string; alt: string; mobileSrc?: string }; isRTL?: boolean; editorial?: boolean }
export default function CollectionHero({ title, subtitle, description, image, isRTL = false, editorial = false }: CollectionHeroProps) {
 const [expanded, setExpanded] = useState(false)
 if (editorial) return <section dir={isRTL ? 'rtl' : 'ltr'} aria-label={title} className="overflow-hidden border-b border-neutral-800 bg-neutral-950 text-white">
  <div className="mx-auto grid max-w-7xl lg:grid-cols-2 lg:items-center">
   <div className="relative aspect-[3/2] w-full lg:order-2"><Image src={image.src} alt={image.alt} fill priority sizes="(min-width: 1280px) 640px, (min-width: 1024px) 50vw, 100vw" className="object-contain" /></div>
   <div className="space-y-5 px-5 py-8 sm:px-8 sm:py-10 lg:order-1 lg:px-10">
    {subtitle && <p className="text-sm font-medium tracking-wide text-atp-gold sm:text-base">{subtitle}</p>}
    <h1 className="text-3xl font-semibold leading-snug sm:text-4xl lg:text-[2.75rem]">{title}</h1>
    {description && <><p id="collection-description" className={`max-w-2xl text-base leading-relaxed text-neutral-200 sm:text-lg ${expanded ? '' : 'line-clamp-3'}`}>{description}</p>{description.length > 160 && <button type="button" aria-expanded={expanded} aria-controls="collection-description" onClick={() => setExpanded(!expanded)} className="min-h-11 text-base text-atp-gold underline underline-offset-4">{expanded ? (isRTL ? 'عرض أقل' : 'Read less') : (isRTL ? 'قراءة الوصف كاملًا' : 'Read full description')}</button>}</>}
    <a href="#collection-products" className="flex min-h-12 w-fit items-center justify-center rounded-lg bg-atp-gold px-6 text-base font-semibold text-black hover:bg-atp-gold/90">{isRTL ? 'تصفح المنتجات' : 'Browse products'}</a>
   </div>
  </div>
 </section>

 return <section dir={isRTL ? 'rtl' : 'ltr'} aria-label={title} className="relative isolate overflow-hidden bg-neutral-950 text-white">
  <Image src={image.src} alt="" fill priority sizes="100vw" className="object-cover opacity-25" />
  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-neutral-950/30" />
  <div className="container relative mx-auto px-4 py-10 sm:py-16"><div className="max-w-3xl space-y-4">
   {subtitle && <p className="text-sm font-medium text-atp-gold sm:text-base">{subtitle}</p>}
   <h1 className="text-3xl font-semibold leading-snug sm:text-4xl lg:text-5xl">{title}</h1>
   {description && <><p id="collection-description" className={`max-w-2xl text-base leading-relaxed text-neutral-200 sm:text-lg ${expanded ? '' : 'line-clamp-3'}`}>{description}</p>{description.length > 160 && <button type="button" aria-expanded={expanded} aria-controls="collection-description" onClick={() => setExpanded(!expanded)} className="min-h-11 text-base text-atp-gold underline underline-offset-4">{expanded ? (isRTL ? 'عرض أقل' : 'Read less') : (isRTL ? 'قراءة الوصف كاملًا' : 'Read full description')}</button>}</>}
   <a href="#collection-products" className="flex min-h-12 w-fit items-center justify-center rounded-lg bg-atp-gold px-6 text-base font-semibold text-black hover:bg-atp-gold/90">{isRTL ? 'تصفح المنتجات' : 'Browse products'}</a>
  </div></div>
 </section>
}
