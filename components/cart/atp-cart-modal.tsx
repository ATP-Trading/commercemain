"use client";

import clsx from "clsx";
import { Dialog } from "@headlessui/react";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { ShoppingCartIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Crown, Star } from "lucide-react";
import LoadingDots from "@/components/loading-dots";
import Price from "@/components/price";
import { MembershipBadge } from "@/components/membership/membership-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  overlayVariants, 
  slideOverVariants, 
  slideOverLeftVariants,
  itemVariants,
  transitions 
} from "@/lib/animations/variants";
import { FreeShippingProgress } from "./free-shipping-progress";
import { EmptyCartState } from "./empty-cart-state";
import { DEFAULT_OPTION } from "@/lib/constants";
import { createUrl } from "@/lib/utils";
import { useMembership } from "@/hooks/use-membership";
import { useMembershipDiscount } from "@/hooks/use-storefront-membership-pricing";
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedProductTitle } from "@/lib/shopify/i18n-queries";

import { useRTL } from "@/hooks/use-rtl";
import Image from "next/image";
import { Link } from "@/src/i18n/navigation";
import { Fragment, useEffect, useRef, useState, useMemo } from "react";
import { useFormStatus } from "react-dom";
import { createCartAndSetCookie, redirectToCheckout } from "./actions";
import { useCart } from "./cart-context";
import { DeleteItemButton } from "./delete-item-button";
import { EditItemQuantityButton } from "./edit-item-quantity-button";
import OpenCart from "./open-cart";
import type { CartItem } from "@/lib/shopify/types";

type MerchandiseSearchParams = {
  [key: string]: string;
};

function ATPCartModal() {
  const { cart, updateCartItem } = useCart();
  const { isMember } = useMembership();
  const { calculateServiceDiscount, checkFreeDeliveryEligibility } =
    useMembershipDiscount();
  const { isRTL } = useRTL();
  const t = useTranslations('cart');
  const locale = useLocale() as 'en' | 'ar';

  // Helper function for price formatting
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2,
    }).format(amount);
  };
  const [isOpen, setIsOpen] = useState(false);
  const quantityRef = useRef(cart?.totalQuantity);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  useEffect(() => {
    if (!cart) {
      createCartAndSetCookie();
    }
  }, [cart]);

  // Remove the auto-open effect since we want to show notifications instead
  // useEffect(() => {
  //   if (
  //     cart?.totalQuantity &&
  //     cart?.totalQuantity !== quantityRef.current &&
  //     cart?.totalQuantity > 0
  //   ) {
  //     if (!isOpen) {
  //       setIsOpen(true);
  //     }
  //     quantityRef.current = cart?.totalQuantity;
  //   }
  // }, [isOpen, cart?.totalQuantity, quantityRef]);

  // Calculate ATP member savings
  const memberSavings = useMemo(() => {
    if (!cart || !isMember)
      return {
        originalTotal: 0,
        memberTotal: 0,
        totalSavings: 0,
        freeDelivery: false,
      };

    let originalTotal = 0;
    let memberTotal = 0;

    // Ensure cart.lines is an array before iterating
    const safeLines = Array.isArray(cart.lines) ? cart.lines : [];

    safeLines.forEach((item: CartItem) => {
      const itemPrice = Number.parseFloat(item.cost.totalAmount.amount);
      const unitPrice = itemPrice / item.quantity;

      // Calculate ATP membership discount (15% for eligible products)
      const discountCalculation = calculateServiceDiscount(
        unitPrice,
        "cosmetics-supplements"
      );

      originalTotal += unitPrice * item.quantity;
      memberTotal += discountCalculation.finalPrice * item.quantity;
    });

    return {
      originalTotal,
      memberTotal,
      totalSavings: originalTotal - memberTotal,
      freeDelivery: checkFreeDeliveryEligibility(),
    };
  }, [cart, isMember, calculateServiceDiscount, checkFreeDeliveryEligibility]);

  return (
    <div className={isRTL ? "font-arabic" : ""}>
      <OpenCart quantity={cart?.totalQuantity} />
      <AnimatePresence>
        {isOpen && (
          <Dialog static open={isOpen} onClose={closeCart} className="relative z-50">
            {/* Backdrop Overlay */}
            <m.div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              aria-hidden="true"
            />
            {/* Slide-over Panel */}
            <m.div
              className={clsx(
                "fixed bottom-0 top-0 flex h-full w-full flex-col border-neutral-200 bg-white/80 p-6 text-black backdrop-blur-xl md:w-[420px] dark:border-neutral-700 dark:bg-black/80 dark:text-white",
                isRTL ? "left-0 border-r" : "right-0 border-l"
              )}
              variants={isRTL ? slideOverLeftVariants : slideOverVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Dialog.Panel className="h-full w-full flex flex-col">
              <div
                className={`flex items-center justify-between mb-4 ${isRTL ? "flex-row-reverse" : ""
                  }`}
              >
                <div
                  className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""
                    }`}
                >
                  <p className="text-lg font-semibold">{t('myCart')}</p>
                  {isMember && (
                    <MembershipBadge tier="atp" className="text-xs" />
                  )}
                </div>
                <button aria-label={t('closeCart')} onClick={closeCart}>
                  <CloseCart />
                </button>
              </div>

              {/* Member Benefits Banner */}
              {!isMember &&
                cart &&
                Array.isArray(cart.lines) &&
                cart.lines.length > 0 && (
                  <Card className="mb-4 bg-atp-gold/10 border-atp-gold/20">
                    <CardContent className="p-3">
                      <div
                        className={`flex items-center gap-2 mb-2 ${isRTL ? "flex-row-reverse text-right" : ""
                          }`}
                      >
                        <Crown className="w-4 h-4 text-atp-gold" />
                        <span className="text-sm font-medium">
                          {isRTL ? "مزايا عضوية ATP" : "ATP Member Benefits"}
                        </span>
                      </div>
                      <p
                        className={`text-xs text-muted-foreground mb-2 ${isRTL ? "text-right" : ""
                          }`}
                      >
                        {isRTL
                          ? "وفر 15% على المشتريات المؤهلة مع عضوية ATP"
                          : "Save 15% on eligible purchases with ATP Membership"}
                      </p>
                      <Link href="/product/atp-membership" onClick={closeCart}>
                        <Badge className="bg-atp-gold text-atp-black text-xs hover:bg-atp-gold/90">
                          {t('joinNow')}
                        </Badge>
                      </Link>
                    </CardContent>
                  </Card>
                )}

              {/* Free Shipping Progress */}
              {cart &&
                Array.isArray(cart.lines) &&
                cart.lines.length > 0 && (
                  <FreeShippingProgress
                    currentTotal={parseFloat(cart.cost.totalAmount.amount)}
                    currency={cart.cost.totalAmount.currencyCode}
                    threshold={250}
                  />
                )}

              {!cart ||
                !Array.isArray(cart.lines) ||
                cart.lines.length === 0 ? (
                <EmptyCartState onClose={closeCart} />
              ) : (
                <div className="flex h-full flex-col justify-between overflow-hidden p-1">
                  <ul className="grow overflow-auto py-4">
                    <AnimatePresence mode="popLayout">
                    {Array.isArray(cart.lines) ? (
                      cart.lines
                        .sort((a: CartItem, b: CartItem) => {
                          const titleA = getLocalizedProductTitle(a.merchandise.product, locale);
                          const titleB = getLocalizedProductTitle(b.merchandise.product, locale);
                          return titleA.localeCompare(titleB);
                        })
                        .map((item: CartItem, i: number) => {
                          const merchandiseSearchParams =
                            {} as MerchandiseSearchParams;

                          item.merchandise.selectedOptions.forEach(
                            ({ name, value }) => {
                              if (value !== DEFAULT_OPTION) {
                                merchandiseSearchParams[name.toLowerCase()] =
                                  value;
                              }
                            }
                          );

                          const merchandiseUrl = createUrl(
                            `/product/${item.merchandise.product.handle}`,
                            new URLSearchParams(merchandiseSearchParams)
                          );

                          // Calculate ATP member pricing for this item
                          const itemPrice = Number.parseFloat(
                            item.cost.totalAmount.amount
                          );
                          const unitPrice = itemPrice / item.quantity;
                          const discountCalculation = isMember
                            ? calculateServiceDiscount(
                              unitPrice,
                              "cosmetics-supplements"
                            )
                            : null;

                          return (
                            <m.li
                              key={item.id || `cart-item-${i}`}
                              layout
                              variants={itemVariants}
                              initial="hidden"
                              animate="visible"
                              exit={{ opacity: 0, x: isRTL ? 100 : -100, transition: transitions.fast }}
                              className="flex w-full flex-col border-b border-neutral-300 dark:border-neutral-700"
                            >
                              <div
                                className={`relative flex w-full flex-row justify-between px-1 py-4 ${isRTL ? "flex-row-reverse" : ""
                                  }`}
                              >
                                <div
                                  className={`absolute z-40 -mt-2 ${isRTL ? "-mr-1" : "-ml-1"
                                    }`}
                                >
                                  <DeleteItemButton
                                    item={item}
                                    optimisticUpdate={updateCartItem}
                                  />
                                </div>
                                <div
                                  className={`flex flex-row ${isRTL ? "flex-row-reverse" : ""
                                    }`}
                                >
                                  <div className="relative h-16 w-16 overflow-hidden rounded-md border border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                                    <Image
                                      className="h-full w-full object-cover"
                                      width={64}
                                      height={64}
                                      alt={
                                        item.merchandise.product.featuredImage
                                          .altText ||
                                        getLocalizedProductTitle(item.merchandise.product, locale)
                                      }
                                      src={
                                        item.merchandise.product.featuredImage
                                          .url || "/placeholder.svg"
                                      }
                                    />
                                  </div>
                                  <Link
                                    href={merchandiseUrl}
                                    onClick={closeCart}
                                    className={`z-30 flex flex-row space-x-4 ${isRTL ? "mr-2 space-x-reverse" : "ml-2"
                                      }`}
                                  >
                                    <div
                                      className={`flex flex-1 flex-col text-base ${isRTL ? "text-right" : ""
                                        }`}
                                    >
                                      <span className="leading-tight">
                                        {getLocalizedProductTitle(item.merchandise.product, locale)}
                                      </span>
                                      {item.merchandise.title !==
                                        DEFAULT_OPTION ? (
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                          {item.merchandise.title}
                                        </p>
                                      ) : null}
                                    </div>
                                  </Link>
                                </div>
                                <div className="flex h-16 flex-col justify-between">
                                  <div
                                    className={`flex flex-col ${isRTL ? "items-start" : "items-end"
                                      }`}
                                  >
                                    {isMember &&
                                      discountCalculation &&
                                      discountCalculation.savings > 0 ? (
                                      <>
                                        <span className="text-xs text-muted-foreground line-through">
                                          {formatPrice(
                                            discountCalculation.originalPrice *
                                            item.quantity
                                          )}
                                        </span>
                                        <Price
                                          className={`text-sm font-semibold text-atp-gold ${isRTL ? "text-left" : "text-right"
                                            }`}
                                          amount={(
                                            discountCalculation.finalPrice *
                                            item.quantity
                                          ).toFixed(2)}
                                          currencyCode={
                                            item.cost.totalAmount.currencyCode
                                          }
                                        />
                                        <span className="text-xs text-atp-gold">
                                          {isRTL ? "توفر" : "Save"}{" "}
                                          {formatPrice(
                                            discountCalculation.savings *
                                            item.quantity
                                          )}
                                        </span>
                                      </>
                                    ) : (
                                      <Price
                                        className={`flex justify-end space-y-2 text-sm ${isRTL ? "text-left" : "text-right"
                                          }`}
                                        amount={item.cost.totalAmount.amount}
                                        currencyCode={
                                          item.cost.totalAmount.currencyCode
                                        }
                                      />
                                    )}
                                  </div>
                                  <div
                                    className={`flex h-9 flex-row items-center rounded-full border border-neutral-200 dark:border-neutral-700 ${isRTL ? "mr-auto" : "ml-auto"
                                      }`}
                                  >
                                    <EditItemQuantityButton
                                      item={item}
                                      type="minus"
                                      optimisticUpdate={updateCartItem}
                                    />
                                    <m.p 
                                      key={item.quantity}
                                      initial={{ scale: 1.3, color: 'var(--atp-gold)' }}
                                      animate={{ scale: 1, color: 'inherit' }}
                                      transition={transitions.springBouncy}
                                      className="w-6 text-center"
                                    >
                                      <span className="w-full text-sm">
                                        {item.quantity}
                                      </span>
                                    </m.p>
                                    <EditItemQuantityButton
                                      item={item}
                                      type="plus"
                                      optimisticUpdate={updateCartItem}
                                    />
                                  </div>
                                </div>
                              </div>
                            </m.li>
                          );
                        })
                    ) : (
                      <li className="text-center text-muted-foreground py-4">
                        {isRTL
                          ? "خطأ في تحميل عناصر السلة"
                          : "Error loading cart items"}
                      </li>
                    )}
                    </AnimatePresence>
                  </ul>

                  <div
                    className={`py-4 text-sm text-neutral-500 dark:text-neutral-400 ${isRTL ? "text-right" : ""
                      }`}
                  >
                    {/* Member Savings Summary */}
                    {isMember &&
                      Array.isArray(cart.lines) &&
                      memberSavings.totalSavings > 0 && (
                        <div className="mb-3 p-3 bg-atp-gold/10 rounded-lg border border-atp-gold/20">
                          <div
                            className={`flex items-center gap-2 mb-2 ${isRTL ? "flex-row-reverse" : ""
                              }`}
                          >
                            <Star className="w-4 h-4 text-atp-gold" />
                            <span className="text-sm font-medium text-atp-gold">
                              {t('memberSavings')}
                            </span>
                          </div>
                          <div
                            className={`flex justify-between text-xs ${isRTL ? "flex-row-reverse" : ""
                              }`}
                          >
                            <span>
                              {isRTL ? "المجموع الأصلي:" : "Original Total:"}
                            </span>
                            <span>
                              {formatPrice(memberSavings.originalTotal)}
                            </span>
                          </div>
                          <div
                            className={`flex justify-between text-xs ${isRTL ? "flex-row-reverse" : ""
                              }`}
                          >
                            <span>
                              {isRTL ? "سعر العضو:" : "Member Price:"}
                            </span>
                            <span>
                              {formatPrice(memberSavings.memberTotal)}
                            </span>
                          </div>
                          <div
                            className={`flex justify-between text-sm font-semibold text-atp-gold border-t border-atp-gold/20 pt-1 mt-1 ${isRTL ? "flex-row-reverse" : ""
                              }`}
                          >
                            <span>{isRTL ? "توفر:" : "You Save:"}</span>
                            <span>
                              {formatPrice(memberSavings.totalSavings)}
                            </span>
                          </div>
                        </div>
                      )}

                    <div
                      className={`mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 dark:border-neutral-700 ${isRTL ? "flex-row-reverse" : ""
                        }`}
                    >
                      <p>{isRTL ? "الضرائب" : "Taxes"}</p>
                      <p
                        className={`text-base text-black dark:text-white ${isRTL ? "text-left" : "text-right"
                          }`}
                      >
                        {isRTL ? "يُحسب عند الدفع" : "Calculated at checkout"}
                      </p>
                    </div>
                    <div
                      className={`mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700 ${isRTL ? "flex-row-reverse" : ""
                        }`}
                    >
                      <p>{t('shipping')}</p>
                      <p className={isRTL ? "text-left" : "text-right"}>
                        {isMember && memberSavings.freeDelivery ? (
                          <span className="text-atp-gold font-medium">
                            {t('free')} - ATP Member
                          </span>
                        ) : isRTL ? (
                          "يُحسب عند الدفع"
                        ) : (
                          "Calculated at checkout"
                        )}
                      </p>
                    </div>
                    <div
                      className={`mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700 ${isRTL ? "flex-row-reverse" : ""
                        }`}
                    >
                      <p className="font-semibold">{t('total')}</p>
                      <Price
                        className={`text-base font-semibold text-black dark:text-white ${isRTL ? "text-left" : "text-right"
                          }`}
                        amount={
                          isMember
                            ? memberSavings.memberTotal.toFixed(2)
                            : cart.cost.totalAmount.amount
                        }
                        currencyCode={cart.cost.totalAmount.currencyCode}
                      />
                    </div>
                  </div>
                  <form action={redirectToCheckout}>
                    <ATPCheckoutButton isMember={isMember} />
                  </form>
                </div>
              )}
              </Dialog.Panel>
            </m.div>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}

function CloseCart({ className }: { className?: string }) {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white">
      <XMarkIcon
        className={clsx(
          "h-6 transition-all ease-in-out hover:scale-110",
          className
        )}
      />
    </div>
  );
}

function ATPCheckoutButton({ isMember }: { isMember: boolean }) {
  const { pending } = useFormStatus();
  const t = useTranslations('cart');
  const { isRTL } = useRTL();

  return (
    <button
      className={clsx(
        "block w-full rounded-full p-3 text-center text-sm font-medium text-white opacity-90 hover:opacity-100 transition-all duration-200",
        isMember
          ? "bg-atp-gold text-atp-black hover:bg-atp-gold/90"
          : "bg-primary hover:bg-primary/90"
      )}
      type="submit"
      disabled={pending}
    >
      {pending ? (
        <LoadingDots className={isMember ? "bg-atp-black" : "bg-white"} />
      ) : (
        <div
          className={`flex items-center justify-center gap-2 ${isRTL ? "flex-row-reverse" : ""
            }`}
        >
          {isMember && <Crown className="w-4 h-4" />}
          {isMember
            ? isRTL
              ? "المتابعة إلى الدفع المتميز"
              : "Proceed to Premium Checkout"
            : t('proceedToCheckout')}
        </div>
      )}
    </button>
  );
}

export default ATPCartModal;
export { ATPCartModal };
