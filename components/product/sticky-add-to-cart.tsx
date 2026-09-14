"use client";

import { useEffect, useState, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { isMemberDiscountEligible } from "@/lib/shopify/member-product-eligibility";
import Price from "@/components/price";
import { useMembershipDiscount } from "@/hooks/use-storefront-membership-pricing";
import { useQuantity } from "@/components/product/quantity-selector";
import { useCart } from "@/components/cart/cart-context";


import type { Product, ProductVariant } from "@/lib/shopify/types";
import { Loader2, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface StickyAddToCartProps {
    product: Product;
    selectedVariant: ProductVariant;
    triggerRef: React.RefObject<HTMLElement | null>;
}

export function StickyAddToCart({ product, selectedVariant, triggerRef }: StickyAddToCartProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const { addCartItem } = useCart();
    const { quantity } = useQuantity();
    const t = useTranslations("product");
    const { calculateServiceDiscount } = useMembershipDiscount();
    const isMembershipProduct = product.handle === "atp-membership" || product.tags.some(tag => tag.toLowerCase().includes("membership"));
    const displayPrice = isMembershipProduct || !isMemberDiscountEligible(product) ? selectedVariant.price.amount : String(calculateServiceDiscount(Number(selectedVariant.price.amount)).finalPrice);

    useEffect(() => {
        if (!triggerRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                // Show sticky bar when the main CTA is NOT visible
                setIsVisible(!entry.isIntersecting);
            },
            {
                root: null,
                rootMargin: "0px",
                threshold: 0,
            }
        );

        observer.observe(triggerRef.current);

        return () => observer.disconnect();
    }, [triggerRef]);

    const handleAddToCart = async () => {
        if (!selectedVariant?.id) return;

        setIsVisible(false); // Hide sticky bar slightly before modal opens
        setIsPending(true);
        try {
            // Add the item multiple times based on selected quantity
            // matching standard AddToCart component behavior (as addCartItem context method adds 1)
            for (let i = 0; i < quantity; i++) {
                await addCartItem(selectedVariant, product);
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsPending(false);
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <m.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={cn(
                        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
                        "bg-white dark:bg-atp-charcoal border-t border-gray-200 dark:border-gray-700",
                        "shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"
                    )}
                >
                    <div className="flex items-center justify-between gap-4 p-4 max-w-screen-xl mx-auto">
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate text-gray-900 dark:text-white">
                                {product.title}
                            </p>
                            <Price
                                amount={displayPrice}
                                currencyCode={selectedVariant.price.currencyCode}
                                className="text-lg font-bold text-atp-gold"
                            />
                        </div>
                        <Button
                            onClick={handleAddToCart}
                            disabled={isPending || !selectedVariant.availableForSale}
                            className="bg-atp-gold hover:bg-atp-gold/90 text-atp-black font-semibold px-6"
                        >
                            {isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    {selectedVariant.availableForSale ? t("addToCart") : t("outOfStock")}
                                </>
                            )}
                        </Button>
                    </div>
                </m.div>
            )}
        </AnimatePresence>
    );
}

export default StickyAddToCart;
