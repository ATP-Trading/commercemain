"use client"

import { useEffect } from "react"
import { m, AnimatePresence } from "framer-motion"
import { X, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import Price from "@/components/price"
import type { CartItem } from "@/lib/shopify/types"
import { useTranslations, useLocale } from "next-intl"

interface CartNotificationProps {
    item: CartItem | null
    isVisible: boolean
    onClose: () => void
}

export function CartNotification({ item, isVisible, onClose }: CartNotificationProps) {
    const t = useTranslations('cart')
    const locale = useLocale()

    console.log("🔔 CartNotification render:", {
        item: item ? {
            title: item.merchandise.product.title,
            quantity: item.quantity,
            hasImage: !!item.merchandise.product.featuredImage?.url
        } : null,
        isVisible
    })

    useEffect(() => {
        if (isVisible) {
            console.log("🔔 CartNotification: Setting auto-hide timer")
            const timer = setTimeout(() => {
                console.log("🔔 CartNotification: Auto-hiding")
                onClose()
            }, 4000) // Auto-hide after 4 seconds

            return () => clearTimeout(timer)
        }
        return undefined
    }, [isVisible, onClose])

    if (!item) {
        console.log("🔔 CartNotification: No item, returning null")
        return null
    }

    // Debug: Always show a simple notification first
    if (isVisible) {
        console.log("🔔 CartNotification: Should be visible now!")
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <m.div
                    key="cart-notification"
                    initial={{ opacity: 0, y: -100, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -100, scale: 0.95 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        duration: 0.3
                    }}
                    className="fixed top-20 right-4 z-[99999] w-80 md:w-96"
                    style={{ zIndex: 99999 }}
                >
                    <Card className="bg-white/95 backdrop-blur-sm border shadow-lg dark:bg-gray-900/95">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                                        {t('itemAddedToCart')}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClose}
                                    aria-label={locale === "ar" ? "إغلاق الإشعار" : "Close notification"}
                                    className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="flex gap-3">
                                <div className="relative h-16 w-16 overflow-hidden rounded-md border bg-gray-100 dark:bg-gray-800">
                                    <Image
                                        className="h-full w-full object-cover"
                                        width={64}
                                        height={64}
                                        alt={item.merchandise.product.featuredImage?.altText || item.merchandise.product.title}
                                        src={item.merchandise.product.featuredImage?.url || "https://via.placeholder.com/64x64?text=Product"}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = "https://via.placeholder.com/64x64?text=Product";
                                        }}
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {item.merchandise?.product?.title || "Product"}
                                    </h4>
                                    {item.merchandise?.title && item.merchandise.title !== "Default Title" && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {item.merchandise.title}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {t('qty', { quantity: item.quantity || 1 })}
                                        </span>
                                        {item.cost?.totalAmount && (
                                            <Price
                                                className="text-sm font-medium"
                                                amount={item.cost.totalAmount.amount}
                                                currencyCode={item.cost.totalAmount.currencyCode}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onClose}
                                    className="flex-1"
                                >
                                    {t('continueShopping')}
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className="flex-1"
                                >
                                    <Link href={`/${locale}/cart`}>
                                        {t('viewCart')}
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </m.div>
            )}
        </AnimatePresence>
    )
}