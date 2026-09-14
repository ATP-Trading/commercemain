'use client'
import Grid from '@/components/grid'
import Image from 'next/image'
import Link from 'next/link'
import Price from '@/components/price'
import type { Product } from '@/lib/shopify/types'
import { getLocalizedProductTitle, getLocalizedProductHandle } from '@/lib/shopify/i18n-queries'
import { isEmsPromotion } from '@/lib/publication-policy'
export default function ProductGridItems({ products, locale = 'en' }: { products: Product[]; locale?: 'en' | 'ar' }) {
 const ar = locale === 'ar'
 return <>{products.filter(product => product?.handle && product.title && !isEmsPromotion(`${product.handle} ${product.title}`)).map((product, index) => {
  const title = getLocalizedProductTitle(product, locale)
  const handle = getLocalizedProductHandle(product, locale)
  const price = product.priceRange.minVariantPrice
  const varies = price.amount !== product.priceRange.maxVariantPrice.amount
  return <Grid.Item key={product.id || product.handle} index={index}><Link href={`/${locale}/product/${encodeURIComponent(handle)}`} className="group flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white text-neutral-950 transition hover:border-atp-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-atp-gold">
   <div className="relative aspect-square w-full bg-white">{product.featuredImage?.url ? <Image src={product.featuredImage.url} alt={title} fill sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, 50vw" className="object-contain p-3 transition-transform group-hover:scale-105" /> : <span className="flex h-full items-center justify-center p-4 text-sm text-neutral-500">{ar ? 'الصورة غير متاحة' : 'Image unavailable'}</span>}</div>
   <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4"><h3 className="line-clamp-3 text-base font-medium leading-relaxed">{title}</h3><div className="mt-auto space-y-1">{varies && <span className="text-sm text-neutral-600">{ar ? 'ابتداءً من' : 'From'}</span>}<Price amount={price.amount} currencyCode={price.currencyCode} className="text-base font-semibold" /></div><span className="flex min-h-11 items-center justify-center rounded-lg bg-neutral-950 px-2 text-sm font-semibold text-white group-hover:bg-neutral-800">{ar ? 'عرض المنتج' : 'View product'}</span></div>
  </Link></Grid.Item>
 })}</>
}
