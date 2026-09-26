'use client'
import { useEffect, useState, type FormEvent } from 'react'
import { useLocale } from 'next-intl'
import { reviewCopy, reviewFetch } from '@/lib/reviews/copy'
interface ProductReviewsProps {
  productId: string
  productTitle: string
  className?: string
}
type PublicReview = {id:string;author:string;body:string;rating:number;createdAt:string}
type Account = {nodes:{id:string;number:number}[];pageInfo:{hasNextPage:boolean;endCursor:string|null}}
const field = 'w-full rounded-lg border border-neutral-400 bg-white p-3 text-neutral-900'
export function ProductReviews({productId, className}: ProductReviewsProps) {
 const locale = useLocale(); const t = reviewCopy[locale === 'ar' ? 'ar' : 'en']
 const [data,setData] = useState<{reviews:PublicReview[];average:number|null;count:number}|null>(null)
 const [account,setAccount] = useState<Account|null>(null); const [message,setMessage] = useState(''); const [busy,setBusy] = useState(false); const [login,setLogin] = useState(false)
 const url = `/api/reviews/product/${encodeURIComponent(productId.split('/').pop() || '')}`
 useEffect(()=>{let active=true;setData(null);setAccount(null);reviewFetch(url).then(d=>{if(active)setData(d)}).catch(()=>{});return()=>{active=false}},[url])
 function error(e:unknown){const code=e instanceof Error?e.message:'unavailable';setMessage(t.errors[code as keyof typeof t.errors] || t.errors.unavailable);if(code==='login_required')setLogin(true)}
 async function loadOrders(more=false){setBusy(true);try{const next=await reviewFetch('/api/reviews/account'+(more&&account?.pageInfo.endCursor?`?after=${encodeURIComponent(account.pageInfo.endCursor)}`:''));setAccount(previous=>({...next,nodes:more&&previous?[...previous.nodes,...next.nodes]:next.nodes}));setLogin(false)}catch(e){error(e)}finally{setBusy(false)}}
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const form=e.currentTarget;const values=new FormData(form);setBusy(true);setMessage('');try{await reviewFetch('/api/reviews',{productId,author:values.get('author'),body:values.get('body'),rating:Number(values.get('rating')),orderId:values.get('orderId')});setData(await reviewFetch(url));setAccount(null);setMessage(t.saved)}catch(e){error(e)}finally{setBusy(false)}}
 if(!data)return null
 return <section className={`mt-8 border-t pt-6 ${className||''}`} aria-label={t.title}>
  <h2 className="text-xl font-semibold">{t.title}</h2>
  {data.average!==null&&<p className="my-2">★ {data.average.toFixed(1)} / 5 · {data.count}</p>}
  <p className="my-3 text-sm text-neutral-600">{t.policy}</p>
  {!data.count&&<p>{t.empty}</p>}
  {data.reviews.map(r=><article key={r.id} className="my-4 rounded-lg border p-4"><div className="flex justify-between gap-3"><strong>{r.author}</strong><span aria-label={`${r.rating}/5`}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span></div><small>{t.verified}</small><p className="my-2 whitespace-pre-wrap break-words">{r.body}</p><time dateTime={r.createdAt}>{new Date(r.createdAt).toLocaleDateString(locale)}</time></article>)}
  {!account&&<button type="button" disabled={busy} onClick={()=>loadOrders()} className="my-4 rounded-lg bg-neutral-900 px-5 py-3 text-white disabled:opacity-50">{t.write}</button>}
  {login&&<a className="block underline" href={`/api/auth/login?returnTo=${encodeURIComponent(typeof window==='undefined'?`/${locale}`:window.location.pathname)}`}>{t.login}</a>}
  {account&&<form onSubmit={submit} className="my-4 grid gap-3"><label>{t.order}<select className={field} name="orderId" required defaultValue=""><option value="">—</option>{account.nodes.map(o=><option key={o.id} value={o.id}>#{o.number}</option>)}</select></label>{account.pageInfo.hasNextPage&&<button type="button" disabled={busy} onClick={()=>loadOrders(true)}>{t.more}</button>}<label>{t.name}<input className={field} name="author" required maxLength={60}/></label><label>{t.rating}<select className={field} name="rating" defaultValue="5">{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} ★</option>)}</select></label><label>{t.body}<textarea className={field} name="body" required minLength={3} maxLength={1500} rows={4}/></label><button disabled={busy} className="rounded-lg bg-neutral-900 p-3 text-white disabled:opacity-50">{t.submit}</button></form>}
  <p role="status" aria-live="polite">{message}</p>
 </section>
}
