"use client"

import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"
import type { CartItem } from "@/lib/shopify/types"
import { useRef, useState } from "react"
import { useInventoryQuantity } from "@/lib/hooks/use-inventory-quantity"
import { stockLimit } from "@/lib/shopify/inventory-limit"
import { useLocale, useTranslations } from "next-intl"

type UpdateType = "plus" | "minus"
type OptimisticUpdateFunction = (merchandiseId: string, updateType: UpdateType) => Promise<void>

function SubmitButton({ type, onClick, disabled }: { type: UpdateType; onClick: () => Promise<void>; disabled: boolean }) {
  const t = useTranslations('cart')
  
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={type === "plus" ? t('increaseItemQuantity') : t('reduceItemQuantity')}
      className={clsx(
        "flex h-10 w-10 flex-none items-center justify-center rounded-md border border-neutral-500 bg-neutral-800 p-2 text-white transition-colors duration-150 enabled:hover:border-[#d4af37] enabled:hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d4af37] disabled:cursor-not-allowed disabled:border-neutral-700 disabled:bg-neutral-900 disabled:text-neutral-500",
        {
          "ml-auto": type === "minus",
        },
      )}
      onClick={onClick}
    >
      {type === "plus" ? (
        <PlusIcon className="h-5 w-5" strokeWidth={2.5} />
      ) : (
        <MinusIcon className="h-5 w-5" strokeWidth={2.5} />
      )}
    </button>
  )
}

export function EditItemQuantityButton({
  item,
  type,
  optimisticUpdate,
}: {
  item: CartItem
  type: UpdateType
  optimisticUpdate: OptimisticUpdateFunction
}) {
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)
  const busy = useRef(false)
  const ar = useLocale() === 'ar'
  const inventory = useInventoryQuantity(item.merchandise.id)
  const limit = stockLimit(inventory.stock)
  const capped = type === 'plus' && limit !== undefined && item.quantity >= limit
  const handleUpdate = async () => {
    if (busy.current || capped) return
    busy.current = true; setPending(true); setFailed(false)
    try { await optimisticUpdate(item.merchandise.id, type) }
    catch { setFailed(true) }
    finally { busy.current = false; setPending(false) }
  }
  return <><SubmitButton type={type} onClick={handleUpdate} disabled={pending || capped || (type === "plus" && (inventory.isLoading || !!inventory.error))} />
    {failed && <span role="alert" className="text-xs text-red-600">{ar ? "تعذر تحديث الكمية. تحقق من المخزون وحدّث السلة." : "Could not update quantity. Check stock and refresh the cart."}</span>}</>
}
