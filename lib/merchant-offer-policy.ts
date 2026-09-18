const origin = 'https://www.atpgroupservices.ae';

/** Public guest terms only; member benefits and combined baskets are checkout-specific. */
export function merchantOfferPolicy(url: string, price: string, currency: string, isMembership = false) {
  const locale = new URL(url, origin).pathname.startsWith('/ar/') ? 'ar' : 'en';
  return {
    ...(!isMembership && currency === 'AED' && Number.isFinite(Number(price)) ? {
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'AE' },
        shippingRate: { '@type': 'MonetaryAmount', currency: 'AED', value: Number(price) >= 250 ? 0 : 15 },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          // Owner-confirmed: handoff within 24 hours, then delivery within 24 hours.
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
        },
      },
    } : {}),
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'AE',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: isMembership ? 7 : 3,
      merchantReturnLink: `${origin}/${locale}/policies/refund-policy`,
      ...(isMembership ? {} : {
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
        itemCondition: 'https://schema.org/NewCondition',
      }),
    },
  };
}
