import { AddToCart } from "@/components/cart/add-to-cart";
import Price from "@/components/price";
import Prose from "@/components/prose";
import type { Product } from "@/lib/shopify/types";
import { VariantSelector } from "./variant-selector";
import { QuantitySelector, QuantityProvider } from "./quantity-selector";
import { useSelectedVariant } from "@/hooks/use-selected-variant";
import { getLocalizedProductTitle } from "@/lib/shopify/i18n-queries";
import { useLocale } from "next-intl";

export function ProductDescription({ product }: { product: Product }) {
  const { price } = useSelectedVariant(product);
  const locale = useLocale() as "en" | "ar";
  const localizedTitle = getLocalizedProductTitle(product, locale);

  return (
    <QuantityProvider>
      <div className="mb-6 flex flex-col border-b border-atp-light-gray pb-6">
        <h1 className="mb-4 text-5xl font-medium">{localizedTitle}</h1>
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <Price
              amount={price.amount}
              currencyCode={price.currencyCode}
              className="text-4xl font-bold text-foreground"
            />
            {product.priceRange.minVariantPrice.amount !==
              product.priceRange.maxVariantPrice.amount && (
              <>
                <span className="text-xl text-gray-500">-</span>
                <Price
                  amount={product.priceRange.minVariantPrice.amount}
                  currencyCode={product.priceRange.minVariantPrice.currencyCode}
                  className="text-4xl font-bold text-foreground"
                />
              </>
            )}
          </div>
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

      {/* Quantity Selector */}
      <div className="mb-6">
        <QuantitySelector productId={product.id} />
      </div>

      {/* Add to Cart Button */}
      <div className="mb-8">
        <AddToCart product={product} />
      </div>

      {/* Product Description */}
      {product.descriptionHtml ? (
        <Prose
          className="mb-6 text-sm leading-tight text-muted-foreground"
          html={product.descriptionHtml}
        />
      ) : null}
    </QuantityProvider>
  );
}
