import { isEmsPromotion } from "@/lib/publication-policy";
// Client-safe types and functions
import type {
  Cart,
  Collection,
  Image,
  Menu,
  Page,
  Product,
  ShopifyAddToCartOperation,
  ShopifyCartOperation,
  ShopifyCollectionOperation,
  ShopifyCollectionProductsOperation,
  ShopifyCollectionsOperation,
  ShopifyCreateCartOperation,
  ShopifyMenuOperation,
  ShopifyPageOperation,
  ShopifyPagesOperation,
  ShopifyProductOperation,
  ShopifyProductRecommendationsOperation,
  ShopifyProductsOperation,
  ShopifyRemoveFromCartOperation,
  ShopifyUpdateCartOperation,
  Connection,
  ShopifyCart,
  ShopifyCollection,
  ShopifyProduct,
} from "./types"

// Re-export types for consumers
export type {
  Cart,
  Collection,
  Image,
  Menu,
  Page,
  Product,
  ShopifyAddToCartOperation,
  ShopifyCartOperation,
  ShopifyCollectionOperation,
  ShopifyCollectionProductsOperation,
  ShopifyCollectionsOperation,
  ShopifyCreateCartOperation,
  ShopifyMenuOperation,
  ShopifyPageOperation,
  ShopifyPagesOperation,
  ShopifyProductOperation,
  ShopifyProductRecommendationsOperation,
  ShopifyProductsOperation,
  ShopifyRemoveFromCartOperation,
  ShopifyUpdateCartOperation,
  Connection,
  ShopifyCart,
  ShopifyCollection,
  ShopifyProduct,
} from "./types"

// Client-safe utility functions
export const removeEdgesAndNodes = <T>(array: Connection<T>): T[] => {
  if (!array || !array.edges) {
    return [];
  }
  return array.edges.map((edge) => edge?.node).filter(Boolean);
};

// Check if a cart line can be salvaged with sanitization
const canSanitizeCartLine = (line: any): boolean => {
  // Must have basic structure and cost data
  if (!line) return false;
  if (!line.merchandise) return false;
  if (!line.cost?.totalAmount) return false;
  // Merchandise ID is essential for cart operations
  if (!line.merchandise.id) return false;
  return true;
};

// Check if a cart line has complete product data (ideal case)
const hasCompleteProductData = (line: any): boolean => {
  return Boolean(
    line?.merchandise?.product?.handle &&
    line?.merchandise?.product?.title
  );
};

// Sanitize cart line to ensure required fields exist
// Creates fallback product data if missing
const sanitizeCartLine = (line: any): any => {
  const merchandise = line.merchandise || {};
  const product = merchandise.product || {};
  
  return {
    ...line,
    merchandise: {
      ...merchandise,
      selectedOptions: merchandise.selectedOptions || [],
      product: {
        id: product.id || merchandise.id || 'unknown',
        handle: product.handle || 'unknown-product',
        title: product.title || 'Product',
        featuredImage: product.featuredImage || null,
      }
    }
  };
};

// Recalculate cart totals from valid lines
// This ensures consistency between displayed items and totals
const recalculateCartTotals = (
  lines: any[],
  originalCost: ShopifyCart['cost']
): { totalQuantity: number; cost: ShopifyCart['cost'] } => {
  if (lines.length === 0) {
    const currencyCode = originalCost?.totalAmount?.currencyCode || 'AED';
    return {
      totalQuantity: 0,
      cost: {
        subtotalAmount: { amount: '0', currencyCode },
        totalAmount: { amount: '0', currencyCode },
      }
    };
  }

  const totalQuantity = lines.reduce((sum, line) => sum + (line.quantity || 0), 0);
  const totalAmount = lines.reduce((sum, line) => {
    const amount = parseFloat(line.cost?.totalAmount?.amount || '0');
    return sum + amount;
  }, 0);

  const currencyCode = lines[0]?.cost?.totalAmount?.currencyCode || 
                       originalCost?.totalAmount?.currencyCode || 
                       'AED';

  return {
    totalQuantity,
    cost: {
      subtotalAmount: { amount: totalAmount.toFixed(2), currencyCode },
      totalAmount: { amount: totalAmount.toFixed(2), currencyCode },
    }
  };
};

// Client-safe data transformation functions
export const reshapeCart = (cart: ShopifyCart): Cart => {
  // NOTE: totalTaxAmount was removed in Shopify Storefront API 2025-01
  // Tax is now calculated at checkout only, so we no longer need to handle it here

  const rawLines = cart.lines ? removeEdgesAndNodes(cart.lines) : [];
  
  // Log for debugging in production
  if (rawLines.length > 0) {
    const linesWithProduct = rawLines.filter(hasCompleteProductData).length;
    const linesWithoutProduct = rawLines.length - linesWithProduct;
    if (linesWithoutProduct > 0) {
      console.warn(`[Cart] ${linesWithoutProduct}/${rawLines.length} cart lines missing complete product data`);
    }
  }
  
  // Filter lines that can be salvaged (have cost and merchandise ID)
  // Then sanitize them with fallback product data
  const validLines = rawLines
    .filter(canSanitizeCartLine)
    .map(sanitizeCartLine);

  const droppedCount = rawLines.length - validLines.length;
  if (droppedCount > 0) {
    console.warn(`[Cart] Dropped ${droppedCount} cart lines with missing essential data (no cost or merchandise ID)`);
  }

  // CRITICAL: Recalculate totals to match the filtered lines
  // This prevents the split-state bug where totals show but items don't
  const recalculatedTotals = recalculateCartTotals(validLines, cart.cost);

  return {
    ...cart,
    lines: validLines,
    totalQuantity: recalculatedTotals.totalQuantity,
    cost: recalculatedTotals.cost,
  };
};

export const reshapeCollection = (
  collection: ShopifyCollection
): Collection | undefined => {
  if (!collection) {
    return undefined;
  }

  return {
    ...collection,
    path: `/collections/${collection.handle}`
  };
};

export const reshapeCollections = (collections: ShopifyCollection[]) => {
  const reshapedCollections = [];

  for (const collection of collections) {
    if (collection) {
      const reshapedCollection = reshapeCollection(collection);

      if (reshapedCollection) {
        reshapedCollections.push(reshapedCollection);
      }
    }
  }

  return reshapedCollections;
};

export const reshapeImages = (images: Connection<Image>, productTitle: string) => {
  const flattened = removeEdgesAndNodes(images);

  return flattened.map((image) => {
    const filename = image.url.match(/.*\/(.*)\..*/)?.[1];
    return {
      ...image,
      altText: image.altText || `${productTitle} - ${filename}`
    };
  });
};

export const reshapeProduct = (
  product: ShopifyProduct,
  filterHiddenProducts: boolean = true
) => {
  const HIDDEN_PRODUCT_TAG = 'nextjs-frontend-hidden';

  if (
    !product ||
    (filterHiddenProducts && (product.tags.includes(HIDDEN_PRODUCT_TAG) || isEmsPromotion(`${product.handle} ${product.title}`)))
  ) {
    return undefined;
  }

  // Validate and fix priceRange structure
  let validatedPriceRange = product.priceRange;
  if (validatedPriceRange) {
    // Ensure maxVariantPrice is an object with proper structure
    if (typeof validatedPriceRange.maxVariantPrice === 'string') {
      console.warn(`[Shopify] Invalid maxVariantPrice structure for product ${product.handle}, fixing...`);
      validatedPriceRange = {
        ...validatedPriceRange,
        maxVariantPrice: {
          amount: validatedPriceRange.maxVariantPrice,
          currencyCode: 'AED' // Default currency
        }
      };
    }

    // Ensure minVariantPrice is an object with proper structure
    if (typeof validatedPriceRange.minVariantPrice === 'string') {
      console.warn(`[Shopify] Invalid minVariantPrice structure for product ${product.handle}, fixing...`);
      validatedPriceRange = {
        ...validatedPriceRange,
        minVariantPrice: {
          amount: validatedPriceRange.minVariantPrice,
          currencyCode: 'AED' // Default currency
        }
      };
    }
  }

  const { images, variants, ...rest } = product;

  return {
    ...rest,
    priceRange: validatedPriceRange,
    images: reshapeImages(images, product.title),
    variants: removeEdgesAndNodes(variants)
  };
};

export const reshapeProducts = (products: ShopifyProduct[]) => {
  const reshapedProducts = [];

  for (const product of products) {
    if (product) {
      const reshapedProduct = reshapeProduct(product);

      if (reshapedProduct) {
        reshapedProducts.push(reshapedProduct);
      }
    }
  }

  return reshapedProducts;
};
