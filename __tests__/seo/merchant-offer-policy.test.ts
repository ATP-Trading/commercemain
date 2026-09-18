import { expect, it } from 'vitest';
import { merchantOfferPolicy } from '@/lib/merchant-offer-policy';
it('uses standard guest delivery at the threshold and the confirmed 48-hour delivery window', () => {
  expect(merchantOfferPolicy('/en/product/cream', '249.99', 'AED').shippingDetails?.shippingRate.value).toBe(15);
  expect(merchantOfferPolicy('/en/product/cream', '250', 'AED').shippingDetails?.shippingRate.value).toBe(0);
  expect(merchantOfferPolicy('/en/product/cream', '79', 'AED').shippingDetails?.deliveryTime.transitTime.maxValue).toBe(1);
  expect(merchantOfferPolicy('/en/product/cream', '250', 'USD').shippingDetails).toBeUndefined();
});
it('separates unopened product returns from unused paid membership refunds', () => {
  const product = merchantOfferPolicy('/ar/product/cream','79','AED');
  expect(product.hasMerchantReturnPolicy.merchantReturnDays).toBe(3);
  expect(product.hasMerchantReturnPolicy.returnFees).toBe('https://schema.org/ReturnFeesCustomerResponsibility');
  expect(product.hasMerchantReturnPolicy.merchantReturnLink).toContain('/ar/policies/refund-policy');
  const membership = merchantOfferPolicy('/en/product/atp-membership','99','AED',true);
  expect(membership.hasMerchantReturnPolicy.merchantReturnDays).toBe(7);
  expect(membership.shippingDetails).toBeUndefined();
});
