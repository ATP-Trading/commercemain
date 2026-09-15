"use client";
import { useState, useEffect } from 'react';
import type { Stock } from '@/lib/shopify/inventory-limit';
export function useInventoryQuantity(variantId: string | null | undefined) {
  const [data, setData] = useState<{ id: string; stock?: Stock; error?: string }>();
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!variantId) return;
    const controller = new AbortController();
    fetch(`/api/inventory?variantId=${encodeURIComponent(variantId)}`, { signal: controller.signal, cache: 'no-store' })
      .then(async response => { if (!response.ok) throw new Error('Stock unavailable'); return response.json(); })
      .then(stock => { if (!controller.signal.aborted) setData({ id: variantId, stock }); })
      .catch(error => { if (!controller.signal.aborted) setData({ id: variantId, error: error.message }); });
    return () => controller.abort();
  }, [variantId, revision]);
  const current = data?.id === variantId ? data : undefined;
  return { stock: current?.stock, quantity: current?.stock?.quantityAvailable ?? null, isLoading: !!variantId && !current, error: current?.error ?? null, refetch: () => { setData(undefined); setRevision(value => value + 1); } };
}
export default useInventoryQuantity;
