"use client";

import { useCart } from "@/components/cart/cart-context";
import { useMembership } from "@/hooks/use-membership";
import { useTranslations } from "@/hooks/use-translations";
import { useRTL } from "@/hooks/use-rtl";
import { useLocale } from "next-intl";
import { getLocalizedProductTitle } from "@/lib/shopify/i18n-queries";
import { 
    ShoppingCartIcon, 
    Crown, 
    Star, 
    ArrowLeft,
    ArrowRight,
    Sparkles,
    Shield,
    Truck,
    Gift,
    Package,
    Clock,
    AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MembershipBadge } from "@/components/membership/membership-badge";
import Price from "@/components/price";
import Image from "next/image";
import { Link } from "@/src/i18n/navigation";
import { DEFAULT_OPTION } from "@/lib/constants";
import { createUrl } from "@/lib/utils";
import { DeleteItemButton } from "@/components/cart/delete-item-button";
import { EditItemQuantityButton } from "@/components/cart/edit-item-quantity-button";
import { redirectToCheckout } from "@/components/cart/actions";
import { useFormStatus } from "react-dom";
import LoadingDots from "@/components/loading-dots";
import type { CartItem } from "@/lib/shopify/types";
import { useMemo } from "react";
import { m, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import { 
    containerVariants, 
    itemVariants, 
    fadeUpVariants,
    scaleVariants,
    stagger 
} from "@/lib/animations/variants";

type MerchandiseSearchParams = {
    [key: string]: string;
};

type Translator = ReturnType<typeof useTranslations>["t"];

// Cart item animation variants - base (exit direction handled dynamically)
const cartItemVariantsBase = {
    hidden: { 
        opacity: 0, 
        y: 20,
        scale: 0.98
    },
    visible: { 
        opacity: 1, 
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number]
        }
    },
    exit: { 
        opacity: 0, 
        x: -50, // Default LTR, overridden in component for RTL
        scale: 0.95,
        transition: {
            duration: 0.3
        }
    }
};

const cartContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1
        }
    }
};

const summaryItemVariantsBase = {
    hidden: { opacity: 0, x: 20 }, // Default LTR
    visible: { 
        opacity: 1, 
        x: 0,
        transition: {
            duration: 0.3,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number]
        }
    }
};

// Stock indicator component for cart items
// Only shows urgency signal when stock < 5 (per client requirement)
function CartStockIndicator({ 
    quantityAvailable,
    tCart,
    tProduct
}: { 
    quantityAvailable?: number | null;
    tCart: Translator;
    tProduct: Translator;
}) {
    // If quantity is unknown, don't show
    if (quantityAvailable === undefined || quantityAvailable === null) {
        return null;
    }

    // Stock is >= 5, don't show urgency signal
    if (quantityAvailable >= 5) {
        return null;
    }

    // Out of stock
    if (quantityAvailable === 0) {
        return (
            <div className="flex items-center gap-1.5 mt-2">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span className="text-xs font-medium text-red-400">{tCart("outOfStock")}</span>
            </div>
        );
    }

    // Low stock warning (1-4)
    return (
        <div className="flex items-center gap-1.5 mt-2">
            <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
            <span className="text-xs font-medium text-amber-400">
                {tProduct("lowStock", { count: quantityAvailable })}
            </span>
        </div>
    );
}

// Validates that a cart item has all required data for rendering
function isValidCartItem(item: CartItem): boolean {
    try {
        return Boolean(
            item &&
            item.merchandise &&
            item.merchandise.product &&
            item.merchandise.product.handle &&
            item.cost &&
            item.cost.totalAmount
        );
    } catch {
        return false;
    }
}

export function CartPageContent() {
    const { cart, updateCartItem } = useCart();
    const { membership, isMember, isLoading: membershipLoading, error: membershipError } = useMembership();
    const { t: tCart } = useTranslations("cart");
    const { t: tProduct } = useTranslations("product");
    const { t: tMembership } = useTranslations("membership");
    const { isRTL } = useRTL();
    const locale = useLocale() as 'en' | 'ar';
    const membershipTierForBadge = membership?.tier;

    // Get only valid cart items for rendering
    const validCartItems = useMemo(() => {
        if (!cart || !Array.isArray(cart.lines)) return [];
        return cart.lines.filter(isValidCartItem);
    }, [cart]);

    if (!cart || validCartItems.length === 0) {
        const BackArrow = isRTL ? ArrowRight : ArrowLeft;
        
        return (
            <LazyMotion features={domAnimation}>
                <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950" dir={isRTL ? "rtl" : "ltr"}>
                    {/* Subtle grid pattern overlay */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMTIsMTc1LDU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
                    
                    <div className="container relative mx-auto px-4 py-12">
                        <m.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <Button 
                                variant="ghost" 
                                asChild 
                                className="mb-4 text-neutral-400 hover:text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors"
                            >
                                <Link href="/" className="flex items-center gap-2">
                                    <BackArrow className="w-4 h-4" />
                                    {tCart("continueShopping")}
                                </Link>
                            </Button>
                            <h1 className="text-4xl font-bold leading-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                                {tCart("shoppingCart")}
                            </h1>
                        </m.div>

                        <m.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="max-w-lg mx-auto"
                        >
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-800/50 border border-neutral-800/50 backdrop-blur-sm p-12 text-center">
                                {/* Decorative glow */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#d4af37]/10 rounded-full blur-3xl" />
                                
                                <m.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.3, type: "spring" }}
                                    className="relative"
                                >
                                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/50 flex items-center justify-center">
                                        <ShoppingCartIcon className="w-10 h-10 text-neutral-500" />
                                    </div>
                                </m.div>
                                
                                <h2 className="text-2xl font-semibold text-white mb-3">
                                    {tCart("yourCartIsEmpty")}
                                </h2>
                                <p className="text-neutral-400 mb-8 max-w-sm mx-auto">
                                    {tCart("page.emptyDescription")}
                                </p>
                                
                                <Button 
                                    asChild
                                    className="bg-gradient-to-r from-[#d4af37] to-[#c9a432] hover:from-[#e5c354] hover:to-[#d4af37] text-black font-semibold px-8 py-3 rounded-xl shadow-lg shadow-[#d4af37]/20 transition-all hover:shadow-[#d4af37]/30 hover:scale-[1.02]"
                                >
                                    <Link href="/">
                                        <Sparkles className="w-4 h-4 me-2" />
                                        {tCart("page.startShopping")}
                                    </Link>
                                </Button>
                            </div>
                        </m.div>
                    </div>
                </div>
            </LazyMotion>
        );
    }

    const BackArrow = isRTL ? ArrowRight : ArrowLeft;
    const itemCount = validCartItems.length;
    const cartItemVariants = {
        ...cartItemVariantsBase,
        exit: {
            ...cartItemVariantsBase.exit,
            x: isRTL ? 50 : -50
        }
    };
    const summaryItemVariants = {
        ...summaryItemVariantsBase,
        hidden: {
            ...summaryItemVariantsBase.hidden,
            x: isRTL ? -20 : 20
        }
    };

    return (
        <LazyMotion features={domAnimation}>
            <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950" dir={isRTL ? "rtl" : "ltr"}>
                {/* Subtle grid pattern overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMTIsMTc1LDU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
                
                <div className="container relative mx-auto px-4 py-8 lg:py-12">
                    {/* Header */}
                    <m.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <Button 
                            variant="ghost" 
                            asChild 
                            className="mb-4 text-neutral-400 hover:text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors"
                        >
                            <Link href="/" className="flex items-center gap-2">
                                <BackArrow className="w-4 h-4" />
                                {tCart("continueShopping")}
                            </Link>
                        </Button>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <h1 className="text-3xl lg:text-4xl font-bold leading-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                                    {tCart("shoppingCart")}
                                </h1>
                                {isMember && membershipTierForBadge && (
                                    <MembershipBadge 
                                        tier={membershipTierForBadge}
                                        showDiscount={false}
                                        className="text-sm" 
                                    />
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-neutral-400">
                                <Package className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    {tCart("page.itemCount", { count: itemCount })}
                                </span>
                            </div>
                        </div>
                    </m.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* Cart Items Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Member Benefits Banner */}
                            {!isMember && !membershipLoading && !membershipError && (
                                <m.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-800/90 to-neutral-900 border border-[#d4af37]/20 p-6"
                                >
                                    {/* Decorative elements */}
                                    <div className="absolute top-0 end-0 w-40 h-40 bg-[#d4af37]/5 rounded-full blur-3xl" />
                                    <div className="absolute bottom-0 start-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-2xl" />
                                    
                                    <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 border border-[#d4af37]/30 flex items-center justify-center">
                                                <Crown className="w-7 h-7 text-[#d4af37]" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-[#d4af37] mb-1">
                                                {tCart("page.unlockMemberBenefits")}
                                            </h3>
                                            <p className="text-neutral-400 text-sm leading-relaxed">
                                                {tCart("page.memberBenefitsDescription")}
                                            </p>
                                        </div>
                                        <Button
                                            asChild
                                            className="bg-gradient-to-r from-[#d4af37] to-[#c9a432] hover:from-[#e5c354] hover:to-[#d4af37] text-black font-semibold rounded-xl shadow-lg shadow-[#d4af37]/20 transition-all hover:shadow-[#d4af37]/30 hover:scale-[1.02] whitespace-nowrap"
                                        >
                                            <Link href="/product/atp-membership">
                                                {tMembership("joinMembership")}
                                            </Link>
                                        </Button>
                                    </div>
                                </m.div>
                            )}

                            {/* Cart Items */}
                            <m.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="rounded-2xl bg-neutral-900/50 border border-neutral-800/50 backdrop-blur-sm overflow-hidden"
                            >
                                <div className="px-6 py-4 border-b border-neutral-800/50">
                                    <h2 className="text-lg font-semibold text-white">{tCart("page.cartItems")}</h2>
                                </div>
                                
                                <m.div 
                                    variants={cartContainerVariants}
                                    initial={false}
                                    animate="visible"
                                    className="divide-y divide-neutral-800/50"
                                >
                                    <AnimatePresence mode="popLayout">
                                        {validCartItems.map((item: CartItem, i: number) => {
                                            const merchandiseSearchParams = {} as MerchandiseSearchParams;

                                            // Safe iteration over selectedOptions
                                            const selectedOptions = item.merchandise.selectedOptions || [];
                                            selectedOptions.forEach(
                                                ({ name, value }) => {
                                                    if (value !== DEFAULT_OPTION) {
                                                        merchandiseSearchParams[name.toLowerCase()] = value;
                                                    }
                                                }
                                            );

                                            const productHandle = item.merchandise.product.handle || '';
                                            const merchandiseUrl = createUrl(
                                                `/product/${productHandle}`,
                                                new URLSearchParams(merchandiseSearchParams)
                                            );

                                            return (
                                                <m.div 
                                                    key={item.id || i}
                                                    variants={cartItemVariants}
                                                    layout
                                                    className="p-6 hover:bg-neutral-800/20 transition-colors"
                                                >
                                                    <div className="flex gap-5">
                                                        {/* Product Image */}
                                                        <div className="relative flex-shrink-0 group">
                                                            <div className="relative h-28 w-28 overflow-hidden rounded-xl bg-neutral-800 border border-neutral-700/50">
                                                                <Image
                                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                                    width={112}
                                                                    height={112}
                                                                    alt={
                                                                        item.merchandise.product.featuredImage?.altText || 
                                                                        getLocalizedProductTitle(item.merchandise.product, locale)
                                                                    }
                                                                    src={
                                                                        item.merchandise.product.featuredImage?.url ||
                                                                        "/placeholder.svg"
                                                                    }
                                                                />
                                                            </div>
                                                            <div className="absolute -top-2 -end-2 z-10">
                                                                <DeleteItemButton
                                                                    item={item}
                                                                    optimisticUpdate={updateCartItem}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Product Details */}
                                                        <div className="flex-1 min-w-0">
                                                            <Link
                                                                href={merchandiseUrl}
                                                                className="block group"
                                                            >
                                                                <h3 className="text-base lg:text-lg font-medium text-white group-hover:text-[#d4af37] transition-colors line-clamp-2">
                                                                    {getLocalizedProductTitle(item.merchandise.product, locale)}
                                                                </h3>
                                                                {item.merchandise.title !== DEFAULT_OPTION && (
                                                                    <p className="text-sm text-neutral-500 mt-1">
                                                                        {item.merchandise.title}
                                                                    </p>
                                                                )}
                                                            </Link>

                                                            {/* Stock Indicator */}
                                                            <CartStockIndicator 
                                                                quantityAvailable={item.merchandise.quantityAvailable}
                                                                tCart={tCart}
                                                                tProduct={tProduct}
                                                            />

                                                            <div className="flex items-center justify-between mt-4">
                                                                {/* Quantity Controls */}
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-sm text-neutral-500">{tCart("page.qtyLabel")}</span>
                                                                    <div className="flex items-center rounded-lg bg-neutral-800/50 border border-neutral-700/50 overflow-hidden">
                                                                        <EditItemQuantityButton
                                                                            item={item}
                                                                            type="minus"
                                                                            optimisticUpdate={updateCartItem}
                                                                        />
                                                                        <span className="px-4 py-2 text-sm font-medium text-white min-w-[40px] text-center">
                                                                            {item.quantity}
                                                                        </span>
                                                                        <EditItemQuantityButton
                                                                            item={item}
                                                                            type="plus"
                                                                            optimisticUpdate={updateCartItem}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Price */}
                                                                <div className={isRTL ? "text-left" : "text-right"}>
                                                                    <Price
                                                                        className="text-lg font-semibold text-white"
                                                                        amount={item.cost.totalAmount.amount}
                                                                        currencyCode={item.cost.totalAmount.currencyCode}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </m.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </m.div>
                            </m.div>

                            {/* Trust Badges */}
                            <m.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="grid grid-cols-3 gap-4"
                            >
                                {[
                                    { icon: Shield, labelKey: "page.trustBadges.securePayment", descKey: "page.trustBadges.sslDesc" },
                                    { icon: Truck, labelKey: "page.trustBadges.fastDelivery", descKey: "page.trustBadges.deliveryTime" },
                                    { icon: Gift, labelKey: "page.trustBadges.easyReturns", descKey: "page.trustBadges.returnPolicy" },
                                ].map((badge, i) => (
                                    <div 
                                        key={i}
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-neutral-900/30 border border-neutral-800/30 text-center"
                                    >
                                        <badge.icon className="w-5 h-5 text-[#d4af37]" />
                                        <div>
                                            <p className="text-sm font-medium text-white">{tCart(badge.labelKey)}</p>
                                            <p className="text-sm leading-relaxed text-neutral-400">{tCart(badge.descKey)}</p>
                                        </div>
                                    </div>
                                ))}
                            </m.div>
                        </div>

                        {/* Order Summary Column */}
                        <div className="lg:col-span-1">
                            <m.div
                                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="sticky top-8 rounded-2xl bg-gradient-to-b from-neutral-900/80 to-neutral-900/40 border border-neutral-800/50 backdrop-blur-sm overflow-hidden"
                            >
                                <div className="px-6 py-5 border-b border-neutral-800/50">
                                    <h2 className="text-lg font-semibold text-white">{tCart("page.orderSummary")}</h2>
                                </div>
                                
                                <div className="p-6 space-y-5">
                                    {membershipError && <p role="status" className="text-sm text-neutral-400">{tCart("page.membershipUnavailable")}</p>}
                                    {isMember && <p className="text-sm text-neutral-400">{tCart("page.memberCheckoutNote")}</p>}

                                    {/* Summary Lines */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-neutral-300">
                                            <span>{tCart("page.subtotalLabel")}</span>
                                            <Price
                                                className="font-medium"
                                                amount={cart.cost.subtotalAmount.amount}
                                                currencyCode={cart.cost.subtotalAmount.currencyCode}
                                            />
                                        </div>

                                        <div className="flex justify-between text-neutral-400">
                                            <span>{tCart("page.shippingLabel")}</span>
                                            <span className="text-neutral-500 text-sm">
                                                {tCart("calculatedAtCheckout")}
                                            </span>
                                        </div>

                                        <div className="flex justify-between text-neutral-400">
                                            <span>{tCart("page.taxesLabel")}</span>
                                            <span className="text-neutral-500 text-sm">
                                                {tCart("calculatedAtCheckout")}
                                            </span>
                                        </div>

                                        <Separator className="bg-neutral-800 my-3" />

                                        <div className="flex justify-between text-xl font-semibold text-white">
                                            <span>{tCart("page.totalLabel")}
                                            </span>
                                            <Price
                                                amount={cart.cost.totalAmount.amount}
                                                currencyCode={cart.cost.totalAmount.currencyCode}
                                            />
                                        </div>
                                    </div>

                                    {/* Checkout Button */}
                                    <form action={redirectToCheckout} className="w-full pt-2">
                                        <CheckoutButton isMember={isMember} t={tCart} />
                                    </form>

                                    {/* Continue Shopping */}
                                    <Button 
                                        variant="outline" 
                                        asChild 
                                        className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white hover:border-neutral-600 rounded-xl"
                                    >
                                        <Link href="/">{tCart("continueShopping")}</Link>
                                    </Button>

                                    {/* Security Note */}
                                    <div className="flex items-center justify-center gap-2 pt-2 text-sm leading-relaxed text-neutral-400">
                                        <Shield className="w-3 h-3" />
                                        <span>{tCart("page.secureCheckout")}</span>
                                    </div>
                                </div>
                            </m.div>
                        </div>
                    </div>
                </div>
            </div>
        </LazyMotion>
    );
}

function CheckoutButton({ isMember, t }: { isMember: boolean; t: Translator }) {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full h-12 bg-gradient-to-r from-[#d4af37] to-[#c9a432] hover:from-[#e5c354] hover:to-[#d4af37] text-black font-semibold rounded-xl shadow-lg shadow-[#d4af37]/20 transition-all hover:shadow-[#d4af37]/30 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {pending ? (
                <LoadingDots className="bg-black" />
            ) : (
                <div className="flex items-center justify-center gap-2">
                    {isMember && <Crown className="w-4 h-4" />}
                    {t("proceedToCheckout")}
                </div>
            )}
        </Button>
    );
}
