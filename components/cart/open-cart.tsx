"use client"
import { useLocale } from "next-intl"
import { ShoppingCartIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"
import Link from "next/link"

export default function OpenCart({
  className,
  quantity,
}: {
  className?: string
  quantity?: number | undefined
}) {
  const locale = useLocale()
  return (
    <Link href={`/${locale}/cart`} aria-label={locale === "ar" ? "السلة" : "Cart"}>
      <div className="relative p-2 sm:p-3 hover:text-yellow-400 hover:bg-gray-900 rounded-full transition-all duration-300">
        <ShoppingCartIcon className={clsx("w-4 h-4 sm:w-5 sm:h-5 transition-all ease-in-out hover:scale-110", className)} />

        {quantity ? (
          <div className="absolute right-0 top-0 -mr-1 -mt-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-yellow-400 text-black text-xs font-bold flex items-center justify-center">
            {quantity}
          </div>
        ) : null}
      </div>
    </Link>
  )
}
