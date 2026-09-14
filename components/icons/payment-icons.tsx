"use client";

import React from 'react';

interface PaymentIconProps {
  className?: string;
  width?: number;
  height?: number;
}

// Unmodified assets from Active Merchant's Shopify-extracted payment icon library.
// Provenance and license: public/payment-icons/SOURCES.md and LICENSE.txt.
function paymentIcon(asset: string, label: string): React.FC<PaymentIconProps> {
  return function PaymentIcon({ className = '', width = 38, height = 24 }) {
    return (
      // Local SVGs preserve each brand's artwork and intrinsic proportions.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={`/payment-icons/${asset}.svg`} alt={label} width={width} height={height}
        className={className} style={{ objectFit: 'contain', flexShrink: 0 }} />
    );
  };
}

export const VisaIcon = paymentIcon('visa', 'Visa');
export const MastercardIcon = paymentIcon('master', 'Mastercard');
export const AmexIcon = paymentIcon('american_express', 'American Express');
export const ApplePayIcon = paymentIcon('apple_pay', 'Apple Pay');
export const GooglePayIcon = paymentIcon('google_pay', 'Google Pay');
export const DinersClubIcon = paymentIcon('diners_club', 'Diners Club');
export const DiscoverIcon = paymentIcon('discover', 'Discover');
export const JCBIcon = paymentIcon('jcb', 'JCB');
export const PayPalIcon = paymentIcon('paypal', 'PayPal');
export const ShopPayIcon = paymentIcon('shopify_pay', 'Shop Pay');
export const TabbyIcon = paymentIcon('tabby', 'Tabby');
export const TamaraIcon = paymentIcon('tamara', 'Tamara');
export const MadaIcon = paymentIcon('mada', 'Mada');
export const UnionPayIcon = paymentIcon('unionpay', 'UnionPay');
export const MaestroIcon = paymentIcon('maestro', 'Maestro');

// Payment icon lookup map
export const PaymentIcons: Record<string, React.FC<PaymentIconProps>> = {
  'visa': VisaIcon,
  'mastercard': MastercardIcon,
  'american_express': AmexIcon,
  'amex': AmexIcon,
  'apple_pay': ApplePayIcon,
  'applepay': ApplePayIcon,
  'google_pay': GooglePayIcon,
  'googlepay': GooglePayIcon,
  'diners_club': DinersClubIcon,
  'dinersclub': DinersClubIcon,
  'discover': DiscoverIcon,
  'jcb': JCBIcon,
  'paypal': PayPalIcon,
  'shop_pay': ShopPayIcon,
  'shoppay': ShopPayIcon,
  'shopify_pay': ShopPayIcon,
  'tabby': TabbyIcon,
  'tamara': TamaraIcon,
  'mada': MadaIcon,
  'unionpay': UnionPayIcon,
  'maestro': MaestroIcon,
};

// Helper to get icon component by name
export function getPaymentIcon(name: string): React.FC<PaymentIconProps> | null {
  const normalizedName = name.toLowerCase().replace(/[\s-]/g, '_');
  return PaymentIcons[normalizedName] || null;
}
