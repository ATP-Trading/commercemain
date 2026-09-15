"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Label } from "@/components/ui/label"
import { Minus, Plus } from "lucide-react"
import { useCart } from "@/components/cart/cart-context"
import { useTranslations, useLocale } from "next-intl"
import { m, LazyMotion, domAnimation } from "framer-motion"

import type { Product } from "@/lib/shopify/types"
import { useSelectedVariant } from "@/hooks/use-selected-variant"
import { useInventoryQuantity } from "@/lib/hooks/use-inventory-quantity"
import { remainingStock } from "@/lib/shopify/inventory-limit"

// Context for sharing quantity state
interface QuantityContextType {
  quantity: number
  inventory: ReturnType<typeof useInventoryQuantity>
  setQuantity: (quantity: number) => void
}

const QuantityContext = createContext<QuantityContextType | undefined>(undefined)

export function QuantityProvider({ children, product }: { children: ReactNode; product: Product }) {
  const { selectedVariantId } = useSelectedVariant(product)
  const inventory = useInventoryQuantity(selectedVariantId)
  const [quantity, setQuantity] = useState(1)

  return (
    <QuantityContext.Provider value={{ quantity, setQuantity, inventory }}>
      {children}
    </QuantityContext.Provider>
  )
}

export function useQuantity() {
  const context = useContext(QuantityContext)
  if (context === undefined) {
    throw new Error("useQuantity must be used within a QuantityProvider")
  }
  return context
}

interface QuantitySelectorProps {
  product: Product
  className?: string
}

export function QuantitySelector({ product, className }: QuantitySelectorProps) {
  const { quantity, setQuantity, inventory } = useQuantity()
  const { cart } = useCart()

  const { selectedVariant } = useSelectedVariant(product)
  const cartQuantity = cart?.lines?.filter(line => line.merchandise.id === selectedVariant?.id).reduce((sum, line) => sum + line.quantity, 0) ?? 0
  const remaining = remainingStock(inventory.stock, cartQuantity)
  const max = remaining === undefined ? undefined : Math.max(1, remaining)
  useEffect(() => { setQuantity(1) }, [selectedVariant?.id])
  useEffect(() => { if (max !== undefined && quantity > max) setQuantity(max) }, [max, quantity, setQuantity])
  const handleQuantityChange = (newQuantity: number) => {
    if (Number.isSafeInteger(newQuantity) && newQuantity >= 1) setQuantity(Math.min(newQuantity, max ?? newQuantity))
  }

  const incrementQuantity = () => {
    handleQuantityChange(quantity + 1)
  }

  const decrementQuantity = () => {
    handleQuantityChange(quantity - 1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1
    handleQuantityChange(value)
  }

  const t = useTranslations('product')
  const ar = useLocale() === 'ar'

  return (
    <LazyMotion features={domAnimation}>
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium text-neutral-400">
            {t('quantity')}
          </Label>
          {cartQuantity > 0 && (
            <m.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs text-[#d4af37] font-medium bg-[#d4af37]/10 px-2 py-0.5 rounded-full border border-[#d4af37]/20"
            >
              {cartQuantity} {t('inCart')}
            </m.span>
          )}
        </div>

        {inventory.error && <p role="alert" className="text-sm">{ar ? "تعذر التحقق من المخزون." : "Stock could not be checked."} <button type="button" onClick={inventory.refetch} className="underline">{ar ? "أعد المحاولة" : "Try again"}</button></p>}
        {remaining !== undefined && <p role="status" className="text-sm text-neutral-300">{remaining === 0 ? (ar ? "الكمية المتوفرة موجودة في سلتك أو نفدت." : "Available stock is already in your cart or sold out.") : (ar ? `يمكنك إضافة ${remaining} قطعة كحد أقصى.` : `You can add up to ${remaining} more.`)}</p>}
        <div className="group relative w-fit">
          {/* Enhanced glow backing on hover */}
          <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#d4af37]/0 via-[#d4af37]/20 to-[#d4af37]/0 opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100" />

          {/* Main container */}
          <div className="relative inline-flex items-center rounded-full bg-black/40 backdrop-blur-xl border border-white/10 ring-1 ring-black/5 shadow-lg overflow-hidden transition-all duration-300 group-hover:border-[#d4af37]/30 group-hover:shadow-[#d4af37]/5">
            <m.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              type="button"
              aria-label={ar ? "تقليل الكمية" : "Decrease quantity"}
              onClick={decrementQuantity}
              disabled={quantity <= 1}
              className="flex items-center justify-center w-12 h-12 text-neutral-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:text-[#d4af37]"
            >
              <Minus className="h-4 w-4 transition-transform group-hover:scale-110" />
            </m.button>

            {/* Subtle separator */}
            <div className="h-5 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

            <input
              aria-label={t("quantity")}
              type="number"
              min="1"
              max={max}
              disabled={inventory.isLoading || !!inventory.error || remaining === 0}
              value={quantity}
              onChange={handleInputChange}
              className="h-12 w-16 text-center border-0 bg-transparent text-white text-lg font-medium tabular-nums caret-[#d4af37] focus:outline-none focus:ring-0 [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none p-0 selection:bg-[#d4af37]/30"
            />

            {/* Subtle separator */}
            <div className="h-5 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

            <m.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              type="button"
              aria-label={ar ? "زيادة الكمية" : "Increase quantity"}
              onClick={incrementQuantity}
              disabled={inventory.isLoading || !!inventory.error || (remaining !== undefined && quantity >= remaining)}
              className="flex items-center justify-center w-12 h-12 text-neutral-400 hover:text-white transition-colors active:text-[#d4af37]"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
            </m.button>
          </div>
        </div>
      </div>
    </LazyMotion>
  )
}