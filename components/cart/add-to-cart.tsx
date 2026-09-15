"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useSelectedVariant } from "@/hooks/use-selected-variant";
import type { Product } from "@/lib/shopify/types";
import { useCart } from "./cart-context";
import { useCartNotification } from "./cart-provider";
import { useQuantity } from "@/components/product/quantity-selector";
import { useTranslations } from "next-intl";

function SubmitButton({
  availableForSale,
  selectedVariantId,
}: {
  availableForSale: boolean;
  selectedVariantId: string | undefined;
}) {
  const t = useTranslations('cart');
  const baseClasses =
    "relative flex w-full items-center justify-center rounded-full p-4 tracking-wide text-white font-medium transition-all duration-200";
  const regularClasses = "bg-primary hover:bg-primary/90";
  const disabledClasses = "cursor-not-allowed opacity-60 hover:opacity-60";

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
        <div className="absolute left-0 ml-4">
          <PlusIcon className="h-5" />
        </div>
        {t('addToCart')}
      </button>
    );
  }

  return (
    <button
      type="submit"
      aria-label={t('addToCart')}
      className={clsx(baseClasses, regularClasses)}
    >
      <div className="absolute left-0 ml-4">
        <PlusIcon className="h-5" />
      </div>
      {t('addToCart')}
    </button>
  );
}

export function AddToCart({ product }: { product: Product }) {
  const { addCartItem } = useCart();
  const { showNotification } = useCartNotification();
  const { quantity } = useQuantity();
  const { selectedVariant, selectedVariantId, availableForSale } =
    useSelectedVariant(product);

  const handleAddToCart = async () => {
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
      <SubmitButton
        availableForSale={availableForSale}
        selectedVariantId={selectedVariantId}
      />
    </form>
  );
}
