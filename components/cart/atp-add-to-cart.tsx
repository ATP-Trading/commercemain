"use client";

import { useRef, useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Crown } from "lucide-react";
import clsx from "clsx";
import { MembershipBadge } from "@/components/membership/membership-badge";
import { useMembership } from "@/hooks/use-membership";
import { useMembershipDiscount } from "@/hooks/use-storefront-membership-pricing";
import { useRTL } from "@/hooks/use-rtl";
import { useSelectedVariant } from "@/hooks/use-selected-variant";
import { useTranslations } from "next-intl";
import type { Product } from "@/lib/shopify/types";
import { useCart } from "./cart-context";
import { useCartNotification } from "./cart-provider";
import { useQuantity } from "@/components/product/quantity-selector";

import { m } from "framer-motion";

function SubmitButton({
  availableForSale,
  selectedVariantId,
  isMember,
  memberSavings,
}: {
  availableForSale: boolean;
  selectedVariantId: string | undefined;
  isMember: boolean;
  memberSavings?: number;
}) {
  const t = useTranslations('cart');
  const { isRTL } = useRTL();

  const baseClasses =
    "group relative flex w-full items-center justify-center rounded-xl p-4 tracking-wide text-black font-semibold overflow-hidden transition-all duration-300";
  const memberClasses = "bg-gradient-to-r from-[#d4af37] to-[#c9a432] shadow-lg shadow-[#d4af37]/30 hover:shadow-[#d4af37]/50 hover:from-[#e5c354] hover:to-[#d4af37]";
  const regularClasses = "bg-gradient-to-r from-[#d4af37] to-[#c9a432] shadow-lg shadow-[#d4af37]/20 hover:shadow-[#d4af37]/40 hover:from-[#e5c354] hover:to-[#d4af37]";
  const disabledClasses = "cursor-not-allowed opacity-50 bg-neutral-800 text-neutral-500 shadow-none hover:scale-100 hover:opacity-50";

  if (!availableForSale) {
    return (
      <button
        disabled
        className={clsx(baseClasses, "bg-neutral-400", disabledClasses)}
      >
        {t('outOfStock')}
      </button>
    );
  }

  if (!selectedVariantId) {
    return (
      <button
        aria-label={t('pleaseSelectOption')}
        disabled
        className={clsx(baseClasses, "bg-neutral-400", disabledClasses)}
      >
        <div className={`absolute ${isRTL ? "right-0 mr-4" : "left-0 ml-4"}`}>
          <PlusIcon className="h-5" />
        </div>
        {t('addToCart')}
      </button>
    );
  }

  return (
    <div className={`space-y-3 ${isRTL ? "font-arabic" : ""}`}>
      {/* Member savings indicator */}
      {isMember && memberSavings && memberSavings > 0 && (
        <div
          className={`flex items-center justify-center gap-2 text-sm ${
            isRTL ? "flex-row-reverse text-right" : ""
          }`}
        >
          <MembershipBadge tier="premium" className="text-xs" />
          <span className="text-atp-gold font-medium">
            {t('saveMembership', { savings: memberSavings })}
          </span>
        </div>
      )}

      <m.button
        type="submit"
        aria-label={t('addToCart')}
        className={clsx(baseClasses, isMember ? memberClasses : regularClasses)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Shimmer effect overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute inset-0 animate-shimmer opacity-70" />
        </div>

        <div className={`absolute ${isRTL ? "right-0 mr-4" : "left-0 ml-4"} text-black/80`}> 
          {isMember ? <Crown className="h-5" /> : <PlusIcon className="h-5" />}
        </div>
        <span className="relative z-10">{t('addToCart')}</span>
      </m.button>
    </div>
  );
}

export function ATPAddToCart({ product }: { product: Product }) {
  const { addCartItem } = useCart();
  const { isRTL } = useRTL();
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);
  const { isMember } = useMembership();
  const { calculateServiceDiscount } = useMembershipDiscount();
  const { showNotification } = useCartNotification();
  const { quantity } = useQuantity();
  const { selectedVariant, selectedVariantId, availableForSale } =
    useSelectedVariant(product);

  // Calculate member savings
  const memberSavings =
    isMember && selectedVariant
      ? calculateServiceDiscount(Number.parseFloat(selectedVariant.price.amount), 'cosmetics-supplements').savings
      : 0;

  const handleAddToCart = async () => {
    if (submitting.current) return;
    setFailed(false);
    console.log("🛒 Add to cart clicked!", {
      selectedVariant,
      product,
      quantity,
    });
    if (selectedVariant) {
      console.log(
        "✅ Adding item to cart:",
        selectedVariant.title,
        "Quantity:",
        quantity
      );

      submitting.current = true;
      setPending(true);
      try {
        // Add the item multiple times based on selected quantity
        for (let i = 0; i < quantity; i++) {
          await addCartItem(selectedVariant, product);
        }

        // Create a cart item for notification with the correct quantity
        const cartItem = {
          id: undefined,
          quantity,
          cost: {
            totalAmount: {
              amount: (
                parseFloat(selectedVariant.price.amount) * quantity
              ).toString(),
              currencyCode: selectedVariant.price.currencyCode,
            },
          },
          merchandise: {
            id: selectedVariant.id,
            title: selectedVariant.title,
            selectedOptions: selectedVariant.selectedOptions,
            product: {
              id: product.id,
              handle: product.handle,
              title: product.title,
              featuredImage: product.featuredImage,
            },
          },
        };

        // Show notification with the added item
        console.log("🔔 Showing notification for:", cartItem);
        showNotification(cartItem);
      } catch (error) {
        console.error("❌ Error adding item to cart:", error);
        setFailed(true);
      } finally {
        submitting.current = false;
        setPending(false);
      }
    } else {
      console.error("❌ No variant selected");
    }
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await handleAddToCart();
      }}
    >
      <fieldset disabled={pending} aria-busy={pending}>
      <SubmitButton
        availableForSale={availableForSale}
        selectedVariantId={selectedVariantId}
        isMember={isMember}
        memberSavings={memberSavings}
      />
      </fieldset>
      {failed && <p role="alert" className="mt-3 text-sm text-red-600">{isRTL ? "لم تكتمل الإضافة. راجع سلتك قبل المحاولة مجددًا." : "The addition did not complete. Check your cart before trying again."}</p>}
    </form>
  );
}
