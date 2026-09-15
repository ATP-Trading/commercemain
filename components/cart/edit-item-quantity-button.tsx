"use client"

import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"
import type { CartItem } from "@/lib/shopify/types"
import { useRef, useState } from "react"
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
        "ease flex h-full min-w-[36px] max-w-[36px] flex-none items-center justify-center rounded-full p-2 transition-all duration-200 hover:border-neutral-800 hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed",
        {
          "ml-auto": type === "minus",
        },
      )}
      onClick={onClick}
    >
      {type === "plus" ? (
        <PlusIcon className="h-4 w-4 dark:text-neutral-500" />
      ) : (
        <MinusIcon className="h-4 w-4 dark:text-neutral-500" />
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
  const limit = stockLimit(item.merchandise)
  const capped = type === 'plus' && limit !== undefined && item.quantity >= limit
  const handleUpdate = async () => {
    if (busy.current || capped) return
    busy.current = true; setPending(true); setFailed(false)
    try { await optimisticUpdate(item.merchandise.id, type) }
    catch { setFailed(true) }
    finally { busy.current = false; setPending(false) }
  }
  return <><SubmitButton type={type} onClick={handleUpdate} disabled={pending || capped} />
    {failed && <span role="alert" className="text-xs text-red-600">{ar ? "تعذر تحديث الكمية. تحقق من المخزون وحدّث السلة." : "Could not update quantity. Check stock and refresh the cart."}</span>}</>
}
