"use client"

import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"
import type { CartItem } from "@/lib/shopify/types"
import { useTranslations } from "next-intl"

type UpdateType = "plus" | "minus"
type OptimisticUpdateFunction = (merchandiseId: string, updateType: UpdateType) => Promise<void>

function SubmitButton({ type, onClick }: { type: UpdateType; onClick: () => Promise<void> }) {
  const t = useTranslations('cart')
  
  return (
    <button
      type="button"
      aria-label={type === "plus" ? t('increaseItemQuantity') : t('reduceItemQuantity')}
      className={clsx(
        "ease flex h-full min-w-[36px] max-w-[36px] flex-none items-center justify-center rounded-full p-2 transition-all duration-200 hover:border-neutral-800 hover:opacity-80",
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
  const payload = {
    merchandiseId: item.merchandise.id,
    quantity: type === "plus" ? item.quantity + 1 : item.quantity - 1,
  }

  const handleUpdate = async () => {
    await optimisticUpdate(payload.merchandiseId, type)
  }

  return <SubmitButton type={type} onClick={handleUpdate} />
}
