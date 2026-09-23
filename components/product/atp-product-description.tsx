"use client";

import { useRef } from "react";
import Image from "next/image";
import { useMembershipDiscount } from "@/hooks/use-storefront-membership-pricing";
import { useInventoryQuantity } from "@/lib/hooks/use-inventory-quantity";
import { ATPAddToCart } from "@/components/cart/atp-add-to-cart";
import { isMemberDiscountEligible, getMemberDiscountRate } from "@/lib/shopify/member-product-eligibility";
import { EnhancedMemberPricing } from "@/components/membership/enhanced-member-pricing";
import { FreeDeliveryIndicator } from "@/components/membership/free-delivery-indicator";
import Price from "@/components/price";
import Prose from "@/components/prose";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrustBadges } from "@/components/ui/trust-badges";
import { ProductReviews } from "@/components/reviews/product-reviews";
import { useRTL } from "@/hooks/use-rtl";
import { useSelectedVariant } from "@/hooks/use-selected-variant";
import { useTranslations } from "next-intl";
import type { Product } from "@/lib/shopify/types";
import {
  getLocalizedProductTitle,
  getLocalizedProductDescription,
  getLocalizedProductDescriptionHtml,
} from "@/lib/shopify/i18n-queries";
import { Award, Leaf, Star } from "lucide-react";
import { VariantSelector } from "./variant-selector";
import { QuantitySelector, QuantityProvider } from "./quantity-selector";
import { StickyAddToCart } from "./sticky-add-to-cart";
import { UrgencySignals } from "./urgency-signals";
import { TabbyPromo } from "./tabby-promo";
import { TamaraWidget } from "./tamara-widget";
import { ProductDescriptionAccordion } from "./product-description-accordion";

export function ATPProductDescription({
  product,
  locale,
}: {
  product: Product;
  locale: "en" | "ar";
}) {
  const t = useTranslations('product');
  const { isRTL } = useRTL();
  const { price, selectedVariant } = useSelectedVariant(product);
  const { hasActiveMembership, calculateServiceDiscount } = useMembershipDiscount();
  const memberPriceApplies = hasActiveMembership && isMemberDiscountEligible(product);
  const installmentBase = memberPriceApplies
    ? calculateServiceDiscount(Number(price.amount), undefined, getMemberDiscountRate(product)).finalPrice
    : Number(price.amount);
  const estimatedInstallment = new Intl.NumberFormat(locale === "ar" ? "ar-AE" : "en-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(installmentBase / 4);
  const addToCartRef = useRef<HTMLDivElement>(null);

  // Fetch real inventory quantity from Shopify Admin API
  const { quantity: inventoryQuantity, isLoading: inventoryLoading } = useInventoryQuantity(
    selectedVariant?.id
  );

  // Get localized content
  const localizedTitle = getLocalizedProductTitle(product, locale);
  const localizedDescription = getLocalizedProductDescription(product, locale);
  const localizedDescriptionHtml = getLocalizedProductDescriptionHtml(
    product,
    locale
  );

  // Determine product category for specialized badges
  const isWellnessProduct = product.tags.some((tag) =>
    ["skincare", "supplements", "wellness", "natural"].includes(
      tag.toLowerCase()
    )
  );
  const isTechProduct = product.tags.some((tag) =>
    ["water-technology", "soil-technology", "tech", "professional"].includes(
      tag.toLowerCase()
    )
  );
  
  // Check if product is a membership/subscription product (digital, no inventory limits)
  const isMembershipProduct = product.tags.some((tag) =>
    ["membership", "subscription", "digital"].includes(tag.toLowerCase())
  ) || product.handle.toLowerCase().includes("membership");

  return (
    <QuantityProvider product={product}>
      <div className={isRTL ? "font-arabic" : ""}>
        <div
          className={`mb-6 flex flex-col border-b border-atp-light-gray pb-6 ${isRTL ? "text-right" : ""
            }`}
        >
          <div
            className={`flex items-center gap-2 mb-3 ${isRTL ? "flex-row-reverse justify-end" : ""
              }`}
          >
            {isWellnessProduct && (
              <Badge
                variant="secondary"
                className="bg-atp-wellness-green/20 text-atp-black"
              >
                <Leaf className="w-3 h-3 mr-1" />
                {t('wellness')}
              </Badge>
            )}
            {isTechProduct && (
              <Badge
                variant="secondary"
                className="bg-blue-500/20 text-blue-700"
              >
                <Award className="w-3 h-3 mr-1" />
                {t('professional')}
              </Badge>
            )}
            {product.tags.includes("premium") && (
              <Badge className="bg-atp-gold text-atp-black">
                <Star className="w-3 h-3 mr-1" />
                {t('premium')}
              </Badge>
            )}
          </div>

          <h1 className="mb-4 text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground leading-tight">
            {localizedTitle}
          </h1>

          {/* Enhanced ATP Member Pricing Display - Hidden for membership product */}
          {!isMembershipProduct && isMemberDiscountEligible(product) ? (
            <div className={`mb-6 ${isRTL ? "text-right" : ""}`}>
              <EnhancedMemberPricing
                originalPrice={price.amount}
                discountRate={getMemberDiscountRate(product)}
                serviceId="cosmetics-supplements"
                currencyCode={price.currencyCode}
                showFreeDelivery={true}
                showMembershipCTA={true}
                productType="product"
              />
            </div>
          ) : (
            /* Simple price display for membership product */
            <div className={`mb-6 ${isRTL ? "text-right" : ""}`}>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold text-neutral-900">
                  <Price
                    amount={price.amount}
                    className="text-2xl font-semibold"
                    currencyCode={price.currencyCode}
                  />
                </span>
                {isMembershipProduct && <span className="text-base text-neutral-600">{locale === "ar" ? "/سنة" : "/year"}</span>}
              </div>
              {isMembershipProduct && <p className="mt-3 text-base leading-relaxed text-neutral-700">{locale === 'ar' ? 'خصم ١٥٪ على المكملات والعناية المؤهلة، و١٠٪ على منتجات المياه والتربة، مع توصيل مجاني داخل الإمارات.' : '15% off eligible supplements and skincare, and 10% off water and soil products, with free delivery within the UAE.'}</p>}
              {isMembershipProduct && <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-600">{locale === 'ar' ? 'تتجدد العضوية تلقائيًا كل سنة. يمكنك إلغاء التجديد من حسابك أو بالتواصل معنا. راجع شروط الاشتراك قبل الدفع.' : 'Membership renews automatically each year. You can cancel renewal through your account or by contacting us. Review the subscription terms before payment.'}</p>}
            </div>
          )}

          {!isMembershipProduct && Number.isFinite(installmentBase) && installmentBase > 0 && (
            <aside
              aria-label={locale === "ar" ? "خيارات الدفع المرن" : "Flexible payment options"}
              className="mb-4 rounded-xl border border-atp-gold/25 bg-atp-gold/5 p-4"
              dir={isRTL ? "rtl" : "ltr"}
            >
              <p className="text-sm font-semibold text-foreground">
                {locale === "ar" ? "كم تكون الدفعة؟" : "How much per payment?"}
              </p>
              <div className="mt-3 space-y-2">
                {(["tabby", "tamara"] as const).map((provider) => (
                  <div key={provider} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-background p-3">
                    <Image src={`/payment-icons/${provider}.svg`} alt={provider === "tabby" ? (locale === "ar" ? "تابي" : "Tabby") : (locale === "ar" ? "تمارا" : "Tamara")} width={57} height={36} />
                    <div className="text-sm text-foreground">
                      <span className="font-semibold"><bdi>{estimatedInstallment} {price.currencyCode === "AED" ? (locale === "ar" ? "درهم" : "AED") : price.currencyCode}</bdi></span>
                      {locale === "ar" ? " تقريبًا × ٤ دفعات" : " approx. × 4 payments"}
                    </div>
                  </div>
                ))}
              </div>
              {memberPriceApplies && <p className="mt-2 text-xs font-medium text-foreground">{locale === "ar" ? "محسوبة بعد خصم عضويتك." : "Based on your member price."}</p>}
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {locale === "ar"
                  ? "تقدير لسعر قطعة واحدة على ٤ دفعات، قبل التوصيل وأي رسوم للمزوّد. المبالغ والخطط النهائية تظهر عند الدفع وتخضع للأهلية وموافقة المزوّد."
                  : "Estimate for one item split into 4 payments, before delivery and any provider fees. Final amounts and plans are shown at checkout, subject to eligibility and provider approval."}
              </p>
            </aside>
          )}

          {/* Tabby Promo - Buy Now, Pay Later */}
          <div className={`mb-4 ${isRTL ? "text-right" : ""}`}>
            <TabbyPromo
              price={price.amount}
              currencyCode={price.currencyCode}
              locale={locale}
              publicKey={process.env.NEXT_PUBLIC_TABBY_PUBLIC_KEY || ""}
              merchantCode={
                price.currencyCode === "SAR"
                  ? "ksa"
                  : price.currencyCode === "KWD"
                    ? "KW"
                    : "default"
              }
            />
          </div>

          {/* Tamara Widget - Buy Now, Pay Later */}
          <div className={`mb-4 ${isRTL ? "text-right" : ""}`}>
            <TamaraWidget
              price={price.amount}
              currencyCode={price.currencyCode}
              locale={locale}
              publicKey={process.env.NEXT_PUBLIC_TAMARA_PUBLIC_KEY || ""}
              countryCode={
                price.currencyCode === "SAR"
                  ? "SA"
                  : price.currencyCode === "KWD"
                    ? "KW"
                    : price.currencyCode === "BHD"
                      ? "BH"
                      : "AE"
              }
            />
          </div>


        </div>

        {/* Variant Selector (only show if there are actual variants with options) */}
        {product.options.length > 0 &&
          product.options.some((option) => option.values.length > 1) && (
            <div className="mb-6">
              <VariantSelector
                options={product.options}
                variants={product.variants}
              />
            </div>
          )}

        {/* Quantity Selector - hidden for membership/digital products */}
        {!isMembershipProduct && (
          <div className="mb-4">
            <QuantitySelector product={product} />
          </div>
        )}

        {/* Urgency Signals - Stock Indicator (Real inventory from Shopify Admin API) */}
        {/* Hidden for membership/digital products since they have unlimited inventory */}
        {selectedVariant && !inventoryLoading && !isMembershipProduct && (
          <div className="mb-4">
            <UrgencySignals
              quantityAvailable={
                // If not available for sale, show 0
                // Otherwise, use the real inventory count from Admin API
                !selectedVariant.availableForSale
                  ? 0
                  : inventoryQuantity
              }
              lowStockThreshold={5}
            />
          </div>
        )}

        {/* Add to Cart Button - with ref for sticky CTA */}
        <div className="mb-4" ref={addToCartRef}>
          <ATPAddToCart product={product} />
        </div>

        <a href="https://wa.me/971569586422" target="_blank" rel="noopener noreferrer"
          className="mb-4 flex min-h-11 items-center justify-center rounded-lg border border-atp-gold px-4 text-base font-medium text-atp-black md:hidden">
          {isRTL ? 'سؤال عن المنتج؟ تواصل عبر واتساب' : 'Questions? Chat with us on WhatsApp'}
        </a>

        {!isMembershipProduct && (
          <div className="mb-5 space-y-2 text-sm leading-relaxed text-neutral-700">
            <p>{isRTL ? 'التسليم للمندوب خلال ٢٤ ساعة، والتوصيل داخل الإمارات خلال ٢٤ ساعة بعدها. رسوم التوصيل ١٥ درهمًا، ومجانية للطلبات من ٢٥٠ درهمًا وللأعضاء الفعّالين.' : 'Handed to the courier within 24 hours, then delivered within 24 hours in the UAE. Delivery is AED 15, free on orders from AED 250 and for active members.'}</p>
            <p>{isRTL ? 'طلب إرجاع المنتج السليم غير المفتوح خلال ٣ أيام من الاستلام، وتكاليف إرجاع تغيير الرأي على العميل. للمنتج المعيب أو الخطأ شروط منفصلة.' : 'Request return of unopened, non-defective products within 3 days of receipt. Change-of-mind return shipping is paid by the customer. Separate terms apply to defective or incorrect products.'} <a href={`/${locale}/policies/refund-policy`} className="underline underline-offset-4">{isRTL ? 'سياسة الاسترداد' : 'Refund policy'}</a></p>
          </div>
        )}

        {/* Trust Badges - below Add to Cart */}
        <div className="mb-6 border-b border-atp-light-gray pb-6">
          <TrustBadges variant="horizontal" />
        </div>

        {/* Product Description - Structured Accordion Layout */}
        {(localizedDescriptionHtml || product.descriptionHtml) && (
          <div className="mb-6">
            <ProductDescriptionAccordion
              descriptionHtml={localizedDescriptionHtml || product.descriptionHtml}
              isRTL={isRTL}
              className={isRTL ? "text-right" : ""}
            />
          </div>
        )}

        {/* Product Reviews - Social Proof Section */}
        <div className="mt-8 pt-8 border-t border-atp-light-gray">
          <ProductReviews
            productId={product.id}
            productTitle={localizedTitle}
          />
        </div>
      </div>

      {/* Sticky Add to Cart for Mobile */}
      {selectedVariant && (
        <StickyAddToCart
          product={product}
          selectedVariant={selectedVariant}
          triggerRef={addToCartRef}
        />
      )}
    </QuantityProvider>
  );
}
