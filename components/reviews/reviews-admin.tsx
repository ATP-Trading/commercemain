'use client'
import { useEffect, useState, type FormEvent } from 'react'
import { useLocale } from 'next-intl'
import { reviewCopy, reviewFetch } from '@/lib/reviews/copy'
import type { Review } from '@/lib/reviews/model'
type Page = {nodes:{id:string;title:string;reviews:Review[]}[];pageInfo:{hasNextPage:boolean;endCursor:string|null}}
export function ReviewsAdmin(){
 const locale=useLocale();const t=reviewCopy[locale==='ar'?'ar':'en'];const [page,setPage]=useState<Page|null>(null);const [cursor,setCursor]=useState<string|null>(null);const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);const [login,setLogin]=useState(false)
 const url='/api/admin/reviews'+(cursor?`?after=${encodeURIComponent(cursor)}`:'')
 function error(e:unknown){const code=e instanceof Error?e.message:'unavailable';setMessage(t.errors[code as keyof typeof t.errors]||t.errors.unavailable);setLogin(code==='login_required')}
 useEffect(()=>{let active=true;setPage(null);reviewFetch(url).then(data=>{if(active){setPage(data);setMessage('')}}).catch(e=>{if(active)error(e)});return()=>{active=false}},[url,locale])
 async function moderate(e:FormEvent<HTMLFormElement>,productId:string,r:Review){e.preventDefault();setBusy(true);try{await reviewFetch('/api/admin/reviews',{productId,reviewId:r.id,action:r.status==='hidden'?'restore':'hide',reason:new FormData(e.currentTarget).get('reason')});setPage(await reviewFetch(url));setMessage(t.saved)}catch(e){error(e)}finally{setBusy(false)}}
 return <main className="mx-auto max-w-3xl px-5 py-10"><h1 className="text-2xl font-bold">{t.admin}</h1><p className="my-4">{t.policy}</p><p role="status">{message}</p>{login&&<a className="underline" href={`/api/auth/login?returnTo=${encodeURIComponent(`/${locale}/admin/reviews`)}`}>{t.login}</a>}
 {page?.nodes.map(p=><section key={p.id} className="my-6"><h2 className="text-lg font-semibold">{p.title}</h2>{p.reviews.length===0&&<p className="text-sm text-neutral-500">0</p>}{p.reviews.map(r=><article key={r.id} className="my-3 rounded-lg border p-4"><strong>{r.author} · {r.rating} ★</strong><p className="whitespace-pre-wrap break-words">{r.body}</p><p>{r.status==='hidden'?t.hidden:t.published}</p><form onSubmit={e=>moderate(e,p.id,r)} className="mt-3 flex flex-wrap gap-2"><input name="reason" aria-label={t.reason} placeholder={t.reason} minLength={3} maxLength={300} required className="min-w-0 flex-1 rounded border border-neutral-400 p-3"/><button disabled={busy} className="rounded bg-neutral-900 px-4 py-3 text-white disabled:opacity-50">{r.status==='hidden'?t.restore:t.hide}</button></form>{r.history.length>0&&<details className="mt-3"><summary>{t.history}</summary>{r.history.map((h,i)=><p key={i}>{h.action==='hide'?t.hide:t.restore} · {h.reason} · {new Date(h.at).toLocaleString(locale)}</p>)}</details>}</article>)}</section>)}
 {page?.pageInfo.hasNextPage&&<button onClick={()=>setCursor(page.pageInfo.endCursor)} className="rounded border p-3">{t.more}</button>}{cursor&&<button onClick={()=>setCursor(null)} className="mx-3 rounded border p-3">↤</button>}
 </main>
}
