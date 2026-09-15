"use client"

import { useState, useTransition } from "react"
import { m, AnimatePresence } from "framer-motion"
import {
  MessageSquare,
  Gift,
  User,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  Loader2,
  Check,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useTranslations } from "next-intl"
import type { CartBuyerIdentity, CartAttribute } from "@/lib/shopify/types"

interface CartEnhancementsProps {
  /** Cart note */
  note?: string | undefined
  /** Cart attributes */
  attributes?: CartAttribute[] | undefined
  /** Buyer identity */
  buyerIdentity?: CartBuyerIdentity | undefined
  /** Function to update cart note */
  onUpdateNote: (note: string) => Promise<{ success: boolean; error?: string }>
  /** Function to update cart attributes */
  onUpdateAttributes: (attributes: CartAttribute[]) => Promise<{ success: boolean; error?: string }>
  /** Whether the component is disabled */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * CartEnhancements Component
 * 
 * Provides additional cart features:
 * - Order notes for special instructions
 * - Gift wrapping option
 * - Buyer identity display (logged-in users)
 */
export function CartEnhancements({
  note = "",
  attributes = [],
  buyerIdentity,
  onUpdateNote,
  onUpdateAttributes,
  disabled = false,
  className = "",
}: CartEnhancementsProps) {
  const t = useTranslations('cart')
  const [isExpanded, setIsExpanded] = useState(false)
  const [noteValue, setNoteValue] = useState(note)
  const [isUpdatingNote, startNoteTransition] = useTransition()
  const [isUpdatingAttributes, startAttributesTransition] = useTransition()
  const [noteSuccess, setNoteSuccess] = useState(false)
  const [noteError, setNoteError] = useState<string | null>(null)

  // Check if gift wrapping is enabled
  const giftWrapping = attributes.find(attr => attr.key === 'gift_wrapping')?.value === 'true'

  const handleNoteBlur = async () => {
    if (noteValue === note) return // No change

    setNoteError(null)
    startNoteTransition(async () => {
      const result = await onUpdateNote(noteValue)
      if (result.success) {
        setNoteSuccess(true)
        setTimeout(() => setNoteSuccess(false), 2000)
      } else {
        setNoteError(result.error || t('enhancements.noteError'))
      }
    })
  }

  const handleGiftWrappingChange = async (checked: boolean) => {
    const newAttributes = attributes.filter(attr => attr.key !== 'gift_wrapping')
    if (checked) {
      newAttributes.push({ key: 'gift_wrapping', value: 'true' })
    }

    startAttributesTransition(async () => {
      await onUpdateAttributes(newAttributes)
    })
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
        disabled={disabled}
      >
        <span className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          {t('enhancements.orderOptions')}
        </span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 overflow-hidden"
          >
            {/* Buyer Identity Display */}
            {buyerIdentity && (buyerIdentity.email || buyerIdentity.customer) && (
              <div className="rounded-lg bg-neutral-50 dark:bg-neutral-900 p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  <User className="h-4 w-4" />
                  {buyerIdentity.customer?.displayName || t('enhancements.loggedInAs')}
                </div>
                {buyerIdentity.email && (
                  <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <Mail className="h-3 w-3" />
                    {buyerIdentity.email}
                  </div>
                )}
                {buyerIdentity.phone && (
                  <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <Phone className="h-3 w-3" />
                    {buyerIdentity.phone}
                  </div>
                )}
              </div>
            )}

            {/* Order Note */}
            <div className="space-y-2">
              <Label htmlFor="cart-note" className="text-sm font-medium">
                {t('enhancements.orderNote')}
              </Label>
              <div className="relative">
                <Textarea
                  id="cart-note"
                  value={noteValue}
                  onChange={(e) => setNoteValue(e.target.value)}
                  onBlur={handleNoteBlur}
                  placeholder={t('enhancements.orderNotePlaceholder')}
                  disabled={disabled || isUpdatingNote}
                  className="min-h-[80px] resize-none text-sm"
                  maxLength={500}
                />
                {isUpdatingNote && (
                  <div className="absolute right-2 top-2">
                    <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                  </div>
                )}
                {noteSuccess && (
                  <div className="absolute right-2 top-2">
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                )}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {noteValue.length}/500 {t('enhancements.characters')}
              </p>
              {noteError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {noteError}
                </p>
              )}
            </div>

            {/* Gift Wrapping */}
            <div className="flex items-start space-x-3 rounded-lg border border-neutral-200 dark:border-neutral-700 p-3">
              <Checkbox
                id="gift-wrapping"
                checked={giftWrapping}
                onCheckedChange={handleGiftWrappingChange}
                disabled={disabled || isUpdatingAttributes}
              />
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="gift-wrapping"
                  className="text-sm font-medium flex items-center gap-2 cursor-pointer"
                >
                  <Gift className="h-4 w-4 text-pink-500" />
                  {t('enhancements.giftWrapping')}
                  {isUpdatingAttributes && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                </Label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {t('enhancements.giftWrappingDescription')}
                </p>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * CartItemEnhanced Component
 * 
 * Enhanced cart item display with:
 * - Compare at price (strike-through original price)
 * - Stock indicator
 * - SKU display (optional)
 */
export function CartItemPriceEnhanced({
  amount,
  currencyCode,
  compareAtAmount,
  quantity,
  className = "",
}: {
  amount: string
  currencyCode: string
  compareAtAmount?: string | undefined
  quantity: number
  className?: string
}) {
  const hasDiscount = compareAtAmount && parseFloat(compareAtAmount) > parseFloat(amount)

  const formatPrice = (value: string) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: currencyCode,
    }).format(parseFloat(value))
  }

  const totalAmount = parseFloat(amount) * quantity
  const totalCompareAt = compareAtAmount ? parseFloat(compareAtAmount) * quantity : 0
  const savings = hasDiscount ? totalCompareAt - totalAmount : 0

  return (
    <div className={`text-right ${className}`}>
      {hasDiscount && (
        <p className="text-xs text-neutral-400 line-through">
          {formatPrice(String(totalCompareAt))}
        </p>
      )}
      <p className="text-sm font-medium text-black dark:text-white">
        {formatPrice(String(totalAmount))}
      </p>
      {savings > 0 && (
        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
          Save {formatPrice(String(savings))}
        </p>
      )}
    </div>
  )
}

/**
 * StockIndicator Component
 * 
 * Shows stock status for cart items
 * Only shows urgency signal when stock < 5 (per client requirement)
 */
export function StockIndicator({
  quantityAvailable,
  quantityInCart,
  className = "",
}: {
  quantityAvailable?: number
  quantityInCart: number
  className?: string
}) {
  const t = useTranslations('cart')

  if (quantityAvailable === undefined) return null

  const isOutOfStock = quantityAvailable === 0
  const isLowStock = quantityAvailable > 0 && quantityAvailable < 5
  const exceedsStock = quantityInCart > quantityAvailable

  // Stock is >= 5, don't show urgency signal
  if (quantityAvailable >= 5 && !exceedsStock) {
    return null
  }

  if (isOutOfStock) {
    return (
      <span className={`text-xs text-red-600 dark:text-red-400 flex items-center gap-1 ${className}`}>
        <AlertTriangle className="h-3 w-3" />
        {t('enhancements.outOfStock')}
      </span>
    )
  }

  if (exceedsStock) {
    return (
      <span className={`text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 ${className}`}>
        <AlertTriangle className="h-3 w-3" />
        {t('enhancements.onlyXLeft', { count: quantityAvailable })}
      </span>
    )
  }

  if (isLowStock) {
    return (
      <span className={`text-xs text-amber-600 dark:text-amber-400 ${className}`}>
        {t('enhancements.onlyXLeft', { count: quantityAvailable })}
      </span>
    )
  }

  return null
}

export default CartEnhancements
