'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
export function useAccountList<T extends { id: string }>(endpoint: string) {
  const [items, setItems] = useState<T[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState(false), [expired, setExpired] = useState(false)
  const [page, setPage] = useState<{ hasNextPage: boolean; endCursor: string | null }>({ hasNextPage: false, endCursor: null })
  const [defaultId, setDefaultId] = useState<string | undefined>()
  const busy = useRef(false)
  const load = useCallback(async (after?: string | null) => {
    if (busy.current) return
    busy.current = true; setLoading(true); setError(false)
    try {
      const response = await fetch(endpoint + (after ? `?after=${encodeURIComponent(after)}` : ''), { cache: 'no-store' })
      if (response.status === 401) { setExpired(true); setItems([]); return }
      if (!response.ok) throw new Error('Unavailable')
      const data = await response.json()
      setItems(previous => after ? [...previous, ...data.nodes.filter((n: T) => !previous.some(p => p.id === n.id))] : data.nodes)
      setPage(data.pageInfo); setDefaultId(data.defaultId); setExpired(false)
    } catch { setError(true) } finally { busy.current = false; setLoading(false) }
  }, [endpoint])
  useEffect(() => { void load() }, [load])
  return { items, loading, error, expired, page, defaultId, load }
}
