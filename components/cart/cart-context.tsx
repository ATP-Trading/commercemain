"use client";

import { assertStockQuantity } from "@/lib/shopify/inventory-limit";
import { trackProduct } from "@/lib/analytics/ga4";
import type {
  Cart,
  CartItem,
  Product,
  ProductVariant,
} from "@/lib/shopify/types";
import type React from "react";
import {
  createContext,
  useContext,
  useMemo,
  useOptimistic,
  startTransition,
} from "react";
import { UAE_DIRHAM_CODE } from "@/lib/constants";
import { useMembershipCart } from "@/hooks/use-membership-cart";

type UpdateType = "plus" | "minus" | "delete";

type CartAction =
  | {
      type: "UPDATE_ITEM";
      payload: { merchandiseId: string; updateType: UpdateType };
    }
  | {
      type: "ADD_ITEM";
      payload: { variant: ProductVariant; product: Product; quantity: number };
    };

type CartContextType = {
  initialCart: Cart | undefined;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function calculateItemCost(quantity: number, price: string): string {
  return (Number(price) * quantity).toString();
}

function updateCartItem(
  item: CartItem,
  updateType: UpdateType
): CartItem | null {
  if (updateType === "delete") return null;

  const newQuantity =
    updateType === "plus" ? item.quantity + 1 : item.quantity - 1;
  if (newQuantity === 0) return null;

  const singleItemAmount = Number(item.cost.totalAmount.amount) / item.quantity;
  const newTotalAmount = calculateItemCost(
    newQuantity,
    singleItemAmount.toString()
  );

  return {
    ...item,
    quantity: newQuantity,
    cost: {
      ...item.cost,
      totalAmount: {
        ...item.cost.totalAmount,
        amount: newTotalAmount,
      },
    },
  };
}

function createOrUpdateCartItem(
  existingItem: CartItem | undefined,
  variant: ProductVariant,
  product: Product,
  addedQuantity = 1
): CartItem {
  const quantity = (existingItem?.quantity ?? 0) + addedQuantity;
  const totalAmount = calculateItemCost(quantity, variant.price.amount);

  const cartItem = {
    id: existingItem?.id,
    quantity,
    cost: {
      totalAmount: {
        amount: totalAmount,
        currencyCode: variant.price.currencyCode,
      },
    },
    merchandise: {
      id: variant.id,
      title: variant.title,
      quantityAvailable: variant.quantityAvailable,
      availableForSale: variant.availableForSale,
      currentlyNotInStock: variant.currentlyNotInStock,
      selectedOptions: variant.selectedOptions,
      product: {
        id: product.id,
        handle: product.handle,
        title: product.title,
        featuredImage: product.featuredImage,
      },
    },
  };

  // Removed console.log for production - cart item created silently
  return cartItem;
}

function updateCartTotals(
  lines: CartItem[]
): Pick<Cart, "totalQuantity" | "cost"> {
  const totalQuantity = lines.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = lines.reduce(
    (sum, item) => sum + Number(item.cost.totalAmount.amount),
    0
  );
  const currencyCode =
    lines[0]?.cost.totalAmount.currencyCode ?? UAE_DIRHAM_CODE;

  return {
    totalQuantity,
    cost: {
      subtotalAmount: { amount: totalAmount.toString(), currencyCode },
      totalAmount: { amount: totalAmount.toString(), currencyCode },
    },
  };
}

function createEmptyCart(): Cart {
  return {
    id: undefined,
    checkoutUrl: "",
    totalQuantity: 0,
    lines: [],
    cost: {
      subtotalAmount: { amount: "0", currencyCode: UAE_DIRHAM_CODE },
      totalAmount: { amount: "0", currencyCode: UAE_DIRHAM_CODE },
    },
  };
}

function cartReducer(state: Cart | undefined, action: CartAction): Cart {
  const currentCart = state || createEmptyCart();

  // Ensure lines is always an array
  const safeLines = Array.isArray(currentCart.lines) ? currentCart.lines : [];

  switch (action.type) {
    case "UPDATE_ITEM": {
      const { merchandiseId, updateType } = action.payload;
      const updatedLines = safeLines
        .map((item) =>
          item.merchandise.id === merchandiseId
            ? updateCartItem(item, updateType)
            : item
        )
        .filter(Boolean) as CartItem[];

      if (updatedLines.length === 0) {
        return {
          ...currentCart,
          lines: [],
          totalQuantity: 0,
          cost: {
            ...currentCart.cost,
            totalAmount: { ...currentCart.cost.totalAmount, amount: "0" },
          },
        };
      }

      return {
        ...currentCart,
        ...updateCartTotals(updatedLines),
        lines: updatedLines,
      };
    }
    case "ADD_ITEM": {
      const { variant, product, quantity } = action.payload;
      const existingItem = safeLines.find(
        (item) => item.merchandise.id === variant.id
      );
      const updatedItem = createOrUpdateCartItem(
        existingItem,
        variant,
        product,
        quantity
      );

      const updatedLines = existingItem
        ? safeLines.map((item) =>
            item.merchandise.id === variant.id ? updatedItem : item
          )
        : [...safeLines, updatedItem];

      return {
        ...currentCart,
        ...updateCartTotals(updatedLines),
        lines: updatedLines,
      };
    }
    default:
      return currentCart;
  }
}

export function CartProvider({
  children,
  initialCart,
}: {
  children: React.ReactNode;
  initialCart: Cart | undefined;
}) {
  // Ensure cart data is properly structured
  const safeInitialCart = initialCart
    ? {
        ...initialCart,
        lines: Array.isArray(initialCart.lines) ? initialCart.lines : [],
      }
    : undefined;

  return (
    <CartContext.Provider value={{ initialCart: safeInitialCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  const [optimisticCart, updateOptimisticCart] = useOptimistic(
    context.initialCart,
    cartReducer
  );

  // Debug cart state changes
  console.log("🛒 Cart state:", {
    totalQuantity: optimisticCart?.totalQuantity,
    itemCount: optimisticCart?.lines?.length,
    lines: optimisticCart?.lines,
  });

  const updateCartItem = async (
    merchandiseId: string,
    updateType: UpdateType,
    customerId?: string
  ) => {
    console.log("🔄 Cart context: updateCartItem called", {
      merchandiseId,
      updateType,
      customerId
    });

    const current = optimisticCart?.lines?.find(line => line.merchandise.id === merchandiseId);
    if (current && updateType === "plus") assertStockQuantity(current.merchandise, current.quantity + 1);
    // First do the optimistic update for immediate UI feedback
    startTransition(() => {
      console.log(
        "🔄 Cart context: Starting optimistic update for",
        updateType
      );
      updateOptimisticCart({
        type: "UPDATE_ITEM",
        payload: { merchandiseId, updateType },
      });
    });

    // Then call the appropriate server action to persist the change
    try {
      console.log("🔄 Cart context: Calling server action for", updateType);
      const { removeFromCartOptimistic, updateCartQuantityOptimistic } =
        await import("./actions");

      if (updateType === "delete") {
        // Find the line item to get the lineId
        console.log(
          "🔍 Looking for line item with merchandiseId:",
          merchandiseId
        );
        console.log(
          "🔍 Available cart lines:",
          optimisticCart?.lines?.map((line) => ({
            id: line.id,
            merchandiseId: line.merchandise.id,
          }))
        );

        const lineItem = optimisticCart?.lines?.find(
          (line) => line.merchandise.id === merchandiseId
        );
        if (lineItem?.id) {
          console.log("🔍 Found line item:", lineItem.id);
          const result = await removeFromCartOptimistic(lineItem.id, customerId);
          if (!result.success) {
            console.error("❌ Remove server action failed:", result.error);
          } else {
            console.log("✅ Remove server action succeeded");
          }
        } else {
          console.error("❌ Line item not found for deletion");
          console.error("❌ Searched for merchandiseId:", merchandiseId);
          console.error(
            "❌ Available merchandise IDs:",
            optimisticCart?.lines?.map((line) => line.merchandise.id)
          );
        }
      } else if (updateType === "plus" || updateType === "minus") {
        // Find the line item and calculate new quantity
        const lineItem = optimisticCart?.lines?.find(
          (line) => line.merchandise.id === merchandiseId
        );
        if (lineItem) {
          const newQuantity =
            updateType === "plus"
              ? lineItem.quantity + 1
              : lineItem.quantity - 1;
          // Pass both lineId (may be undefined for new items) and merchandiseId as fallback
          const result = await updateCartQuantityOptimistic(
            lineItem.id || "",
            newQuantity,
            customerId,
            merchandiseId // Pass merchandiseId as fallback for finding the item
          );
          if (!result.success) {
            console.error(
              "❌ Update quantity server action failed:",
              result.error
            );
            throw new Error(result.error);
          } else {
            console.log("✅ Update quantity server action succeeded");
          }
        } else {
          console.error("❌ Line item not found for quantity update");
        }
      }
    } catch (error) {
      console.error("❌ Error calling server action:", error);
      throw error;
    }
  };

  const addCartItem = async (
    variant: ProductVariant, 
    product: Product, 
    customerId?: string,
    quantity = 1
  ) => {
    console.log("🔄 Cart context: addCartItem called", { variant, product, customerId });

    // Create the cart item for the notification
    const existingItem = optimisticCart?.lines?.find(
      (item) => item.merchandise.id === variant.id
    );
    assertStockQuantity(variant, (existingItem?.quantity ?? 0) + quantity);
    const cartItem = createOrUpdateCartItem(existingItem, variant, product, quantity);

    // First do the optimistic update for immediate UI feedback
    startTransition(() => {
      console.log("🔄 Cart context: Starting optimistic update");
      updateOptimisticCart({ type: "ADD_ITEM", payload: { variant, product, quantity } });
    });

    // Then call the server action to persist the change
    try {
      console.log("🔄 Cart context: Calling server action");
      const { addToCartOptimistic } = await import("./actions");
      const result = await addToCartOptimistic(variant.id, quantity, customerId);

      if (!result.success) {
        console.error("❌ Server action failed:", result.error);
        throw new Error(result.error || "Failed to add item to cart");
      } else {
        console.log("✅ Server action succeeded");
      }
    } catch (error) {
      console.error("❌ Error calling server action:", error);
      throw error;
    }

    trackProduct("add_to_cart", { item_id: product.id, item_name: product.title, price: Number(variant.price.amount), quantity }, variant.price.currencyCode);
    return cartItem;
  };

  return useMemo(
    () => ({
      cart: optimisticCart,
      updateCartItem,
      addCartItem,
    }),
    [optimisticCart]
  );
}
