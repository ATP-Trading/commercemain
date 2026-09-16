/**
 * Enhanced Cart Modal with Membership Benefits
 * 
 * Cart modal that displays membership benefits, discounts, and free delivery.
 * Integrates with membership cart middleware for real-time benefit calculation.
 */

'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCart } from './cart-context';
import { useMembershipCart } from '@/hooks/use-membership-cart';
import { MembershipBenefitsDisplay, FreeDeliveryIndicator, ServiceDiscountIndicator } from './membership-benefits-display';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';
import { ShoppingBagIcon, MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { DirhamSymbol } from '@/components/icons/dirham-symbol';
import Image from 'next/image';
import Link from 'next/link';
import Price from '@/components/price';

interface EnhancedCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId?: string;
}

/**
 * Enhanced cart modal with membership integration
 * Requirements: 4.3, 5.1, 5.2 - Show membership benefits in cart
 */
export function EnhancedCartModal({ 
  isOpen, 
  onClose, 
  customerId 
}: EnhancedCartModalProps) {
  const t = useTranslations('cart');
  const { cart } = useCart();
  const {
    enhancedCart,
    membershipBenefits,
    benefitsSummary,
    updateQuantityWithBenefits,
    removeFromCartWithBenefits,
    validateMembershipStatus,
    isLoadingBenefits
  } = useMembershipCart(customerId);

  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const displayCart = enhancedCart || cart;
  const hasItems = displayCart && displayCart.lines.length > 0;

  const handleQuantityUpdate = async (
    lineId: string,
    merchandiseId: string,
    newQuantity: number
  ) => {
    setIsUpdating(lineId);
    try {
      await updateQuantityWithBenefits(lineId, merchandiseId, newQuantity);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemoveItem = async (lineId: string) => {
    setIsUpdating(lineId);
    try {
      await removeFromCartWithBenefits(lineId);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleCheckout = async () => {
    if (customerId) {
      // Validate membership status before checkout
      await validateMembershipStatus();
    }
    
    // Redirect to checkout
    if (displayCart?.checkoutUrl) {
      window.location.href = displayCart.checkoutUrl;
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          {t('shoppingCart')}
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={onClose}
                          >
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">{t('closePanel')}</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      {/* Membership Benefits Display */}
                      {customerId && (
                        <div className="mt-4">
                          <MembershipBenefitsDisplay 
                            customerId={customerId}
                            compact={true}
                          />
                        </div>
                      )}

                      {/* Cart Items */}
                      <div className="mt-8">
                        <div className="flow-root">
                          {!hasItems ? (
                            <div className="text-center py-12">
                              <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
                              <h3 className="mt-2 text-sm font-medium text-gray-900">
                                {t('yourCartIsEmpty')}
                              </h3>
                              <p className="mt-1 text-sm text-gray-500">
                                {t('startAddingItems')}
                              </p>
                            </div>
                          ) : (
                            <ul role="list" className="-my-6 divide-y divide-gray-200">
                              {displayCart.lines.map((item) => (
                                <li key={item.id} className="flex py-6">
                                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                    <Image
                                      src={item.merchandise.product.featuredImage.url}
                                      alt={item.merchandise.product.featuredImage.altText}
                                      width={96}
                                      height={96}
                                      className="h-full w-full object-cover object-center"
                                    />
                                  </div>

                                  <div className="ml-4 flex flex-1 flex-col">
                                    <div>
                                      <div className="flex justify-between text-base font-medium text-gray-900">
                                        <h3>
                                          <Link href={`/product/${item.merchandise.product.handle}`}>
                                            {item.merchandise.product.title}
                                          </Link>
                                        </h3>
                                        <div className="text-right">
                                          <Price
                                            amount={item.cost.totalAmount.amount}
                                            currencyCode={item.cost.totalAmount.currencyCode}
                                          />
                                        </div>
                                      </div>
                                      
                                      {/* Service Discount Indicator */}
                                      {customerId && item.id && (
                                        <ServiceDiscountIndicator
                                          lineId={item.id}
                                          customerId={customerId}
                                          className="mt-1"
                                        />
                                      )}
                                      
                                      <p className="mt-1 text-sm text-gray-500">
                                        {item.merchandise.title}
                                      </p>
                                    </div>
                                    
                                    <div className="flex flex-1 items-end justify-between text-sm">
                                      <div className="flex items-center space-x-2">
                                        <button
                                          type="button"
                                          onClick={() => item.id && handleQuantityUpdate(
                                            item.id,
                                            item.merchandise.id,
                                            item.quantity - 1
                                          )}
                                          disabled={isUpdating === item.id || item.quantity <= 1}
                                          className="p-1 text-gray-400 hover:text-gray-500 disabled:opacity-50"
                                        >
                                          <MinusIcon className="h-4 w-4" />
                                        </button>
                                        
                                        <span className="text-gray-500 min-w-[2rem] text-center">
                                          {isUpdating === item.id ? '...' : item.quantity}
                                        </span>
                                        
                                        <button
                                          type="button"
                                          onClick={() => item.id && handleQuantityUpdate(
                                            item.id,
                                            item.merchandise.id,
                                            item.quantity + 1
                                          )}
                                          disabled={isUpdating === item.id}
                                          className="p-1 text-gray-400 hover:text-gray-500 disabled:opacity-50"
                                        >
                                          <PlusIcon className="h-4 w-4" />
                                        </button>
                                      </div>

                                      <div className="flex">
                                        <button
                                          type="button"
                                          onClick={() => item.id && handleRemoveItem(item.id)}
                                          disabled={isUpdating === item.id}
                                          className="font-medium text-red-600 hover:text-red-500 disabled:opacity-50"
                                        >
                                          <TrashIcon className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer with totals and checkout */}
                    {hasItems && (
                      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                        <div className="space-y-4">
                          {/* Free Delivery Indicator */}
                          {customerId && (
                            <FreeDeliveryIndicator customerId={customerId} />
                          )}
                          
                          <Separator />
                          
                          {/* Subtotal */}
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <p>{t('subtotal')}</p>
                            <Price
                              amount={displayCart.cost.subtotalAmount.amount}
                              currencyCode={displayCart.cost.subtotalAmount.currencyCode}
                            />
                          </div>
                          
                          {/* Membership Savings */}
                          {benefitsSummary.totalSavings > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                              <p>{t('memberSavings')}</p>
                              <p className="flex items-center gap-1">
                                -<DirhamSymbol size={14} />{benefitsSummary.totalSavings.toFixed(2)}
                              </p>
                            </div>
                          )}
                          
                          {/* Total */}
                          <div className="flex justify-between text-lg font-bold text-gray-900">
                            <p>{t('total')}</p>
                            <Price
                              amount={displayCart.cost.totalAmount.amount}
                              currencyCode={displayCart.cost.totalAmount.currencyCode}
                            />
                          </div>
                          
                          <p className="mt-0.5 text-sm text-gray-500">
                            {t('shippingAndTaxes')}
                          </p>
                          
                          <div className="mt-6">
                            <Button
                              onClick={handleCheckout}
                              disabled={isLoadingBenefits}
                              className="w-full"
                            >
                              {isLoadingBenefits 
                                ? t('validating') 
                                : t('checkout')
                              }
                            </Button>
                          </div>
                          
                          <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                            <p>
                              {t('or')}{' '}
                              <button
                                type="button"
                                className="font-medium text-primary hover:text-primary/80"
                                onClick={onClose}
                              >
                                {t('continueShopping')}
                                <span aria-hidden="true"> &rarr;</span>
                              </button>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}