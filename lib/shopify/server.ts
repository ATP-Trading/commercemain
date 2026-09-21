import { getOnlineStock } from "./stock-server"
import { assertStockQuantity } from "./inventory-limit"
import { prepareMembershipLines, variantPlanQuery, type PurchaseLine, type VariantPlans } from './membership-purchase'
import 'server-only'
import { getLocale } from 'next-intl/server'
import { isEmsPromotion } from '@/lib/publication-policy'

import { TAGS } from "@/lib/constants"
import { isObject, isShopifyError } from "@/lib/type-guards"
import { ensureStartsWith } from "@/lib/utils"
import { validateEnvironmentVariables } from "@/lib/config"
import { mockCart, mockCollections, mockProducts, createMockResponse } from "./mock-data"
import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import { cookies, headers as requestHeaders } from "next/headers"
import { config } from "@/lib/config"

import {
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
  ShopifyMenuItem,
  ShopifyPageOperation,
  ShopifyPagesOperation,
  ShopifyProductOperation,
  ShopifyProductRecommendationsOperation,
  ShopifyProductsOperation,
  ShopifyRemoveFromCartOperation,
  ShopifyUpdateCartOperation,
  UpdateCartBuyerIdentityOperation,
  Connection,
  ShopifyCart,
  ShopifyCollection,
  ShopifyProduct,
  PaymentSettings,
  ShopifyShopPaymentSettingsOperation,
  ShopPolicy,
  ShopPolicyOperation,
  CartBuyerIdentityInput,
} from "./types"
import {
  addToCartMutation,
  createCartMutation,
  editCartItemsMutation,
  getCartQuery,
  getCollectionQuery,
  getCollectionProductsQuery,
  getCollectionsQuery,
  getMenuQuery,
  getPageQuery,
  getPagesQuery,
  getProductQuery,
  getProductRecommendationsQuery,
  getProductsQuery,
  removeFromCartMutation,
  getFeaturedProductsQuery,
  getNewestProductsQuery,
} from "./queries"
import { getShopPaymentSettingsQuery, getShopPolicyQuery } from "./queries/shop"

import {
  removeEdgesAndNodes,
  reshapeCart,
  reshapeCollection,
  reshapeCollections,
  reshapeImages,
  reshapeProduct,
  reshapeProducts,
} from "./client"

// Validate required environment variables
const isEnvValid = validateEnvironmentVariables()

const domain = ensureStartsWith(config.shopify.domain!, "https://")
// Use the API version from config dynamically
const endpoint = `${domain}/api/${config.shopify.apiVersion}/graphql.json`
const key = config.shopify.accessToken!

type ExtractVariables<T> = T extends { variables: object } ? T["variables"] : never

async function getBuyerIpForShopify(): Promise<string | null> {
  try {
    const headerStore = await requestHeaders()
    const forwardedFor = headerStore.get('x-forwarded-for') || headerStore.get('x-vercel-forwarded-for')
    const realIp =
      headerStore.get('x-real-ip') ||
      headerStore.get('cf-connecting-ip') ||
      headerStore.get('x-client-ip')

    const clientIp = forwardedFor?.split(',')[0]?.trim() || realIp?.trim()
    return clientIp || null
  } catch {
    return null
  }
}

export async function shopifyFetch<T>({
  headers,
  query,
  variables,
}: {
  headers?: HeadersInit
  query: string
  variables?: ExtractVariables<T>
}): Promise<{ status: number; body: T } | never> {
  try {
    // Check if environment variables are properly configured
    if (!isEnvValid) {
      throw new Error('Shopify environment variables are missing or invalid')
    }

    console.log(`[Shopify] Making request to: ${endpoint}`)

    const buyerIp = await getBuyerIpForShopify()

    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": key,
        ...(buyerIp ? { 'Shopify-Storefront-Buyer-IP': buyerIp } : {}),
        ...headers,
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables }),
      }),
      // Disable caching to ensure fresh data with @inContext
      cache: 'no-store',
      // Add timeout for better error handling
      signal: AbortSignal.timeout(15000), // 15 second timeout
    })

    if (!result.ok) {
      console.error(`[Shopify] HTTP ${result.status}: ${result.statusText}`)
      throw new Error(`HTTP ${result.status}: ${result.statusText}`)
    }

    // Check if the response is valid JSON
    const contentType = result.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`[Shopify] Invalid response content type: ${contentType}`)
      const text = await result.text()
      console.error('[Shopify] Response body:', text.substring(0, 200))
      throw new Error(`Invalid response content type: ${contentType}`)
    }

    const body = await result.json()

    if (body.errors) {
      console.error('[Shopify] GraphQL errors:', body.errors)
      throw body.errors[0]
    }

    return {
      status: result.status,
      body,
    }
  } catch (e: unknown) {
    const details = isObject(e) ? e : undefined
    const message = typeof details?.message === 'string' ? details.message : undefined
    // Enhanced error logging with helpful context
    console.error('[Shopify] Request failed:', {
      endpoint: endpoint.substring(0, 50) + '...',
      error: message,
      cause: details?.cause?.toString(),
      queryType: query.includes('query') ? 'query' : 'mutation',
    })

    if (isShopifyError(e)) {
      throw {
        cause: e.cause?.toString() || "Network error",
        status: e.status || 500,
        message: e.message || "Shopify API request failed",
        query,
      }
    }

    // Handle network-specific errors with helpful messages
    if (details?.name === 'TypeError' && (message?.includes('fetch') || message?.includes('ENOTFOUND'))) {
      console.error('🔧 Network Issue: Unable to connect to Shopify store')
      console.error('💡 Solutions:')
      console.error('   1. Check your internet connection')
      console.error('   2. Verify store domain in .env.local')
      console.error('   3. Ensure store exists and is accessible')

      throw {
        cause: 'Network connection failed - store domain not found',
        status: 500,
        message: `Unable to connect to ${config.shopify.domain}. Please check your store domain.`,
        query,
      }
    }

    throw {
      error: e,
      query,
    }
  }
}

/** Mutations of an existing cart must never send a missing session identity. */
async function requireCartId(): Promise<string> {
  const cartId = (await cookies()).get('cartId')?.value
  if (!cartId) throw new Error('No cart found')
  return cartId
}

async function preparePurchaseLines(lines: PurchaseLine[]) {
  return prepareMembershipLines(lines, async id => {
    const res = await shopifyFetch<{ data: { node: VariantPlans | null }; variables: { id: string } }>({ query: variantPlanQuery, variables: { id } })
    return res.body.data.node
  })
}

function assertCartAccepted(cart: Cart, lines: PurchaseLine[], existing?: Cart) {
  for (const id of new Set(lines.map(line => line.merchandiseId))) {
    const requested = lines.filter(line => line.merchandiseId === id).reduce((sum, line) => sum + line.quantity, 0)
      + (existing?.lines.filter(line => line.merchandise.id === id).reduce((sum, line) => sum + line.quantity, 0) ?? 0);
    const accepted = cart.lines.filter(line => line.merchandise.id === id).reduce((sum, line) => sum + line.quantity, 0);
    if (accepted !== requested) throw new Error('STOCK_LIMIT');
  }
}

async function validateStock(lines: (PurchaseLine & { id?: string })[], existing: Cart | undefined, updating = false) {
  const totals = new Map<string, number>();
  for (const line of existing?.lines ?? []) totals.set(line.merchandise.id, (totals.get(line.merchandise.id) ?? 0) + line.quantity);
  for (const line of lines) {
    if (!Number.isSafeInteger(line.quantity) || line.quantity < 1) throw new Error('STOCK_LIMIT');
    const previous = updating ? existing?.lines.find(item => item.id === line.id)?.quantity ?? 0 : 0;
    totals.set(line.merchandiseId, (totals.get(line.merchandiseId) ?? 0) - previous + line.quantity);
  }
  await Promise.all([...new Set(lines.map(line => line.merchandiseId))].map(async id => {
    assertStockQuantity(await getOnlineStock(id), totals.get(id)!);
  }));
}

export async function createCart(lines: PurchaseLine[] = []): Promise<Cart> {
  await validateStock(lines, undefined)
  const prepared = await preparePurchaseLines(lines)
  const res = await shopifyFetch<ShopifyCreateCartOperation>({
    query: createCartMutation,
    variables: { input: { lines: prepared }, language: (await getLocale()) === "ar" ? "AR" : "EN" }
  })
  const result = res.body.data.cartCreate
  if (result.userErrors?.length || !result.cart) throw new Error('Unable to create cart')
  const cart = reshapeCart(result.cart)
  if (!cart.id) throw new Error('Cart identity is missing')
  ;(await cookies()).set('cartId', cart.id)
  assertCartAccepted(cart, lines)
  return cart
}

export async function addToCart(lines: PurchaseLine[]): Promise<Cart> {
  const cartId = (await cookies()).get('cartId')?.value
  if (!cartId) return createCart(lines)
  const existing = await getCart()
  await validateStock(lines, existing)
  const prepared = await preparePurchaseLines(lines)
  const res = await shopifyFetch<ShopifyAddToCartOperation>({
    query: addToCartMutation,
    variables: { cartId, language: (await getLocale()) === "ar" ? "AR" : "EN", lines: prepared }
  })
  const result = res.body.data.cartLinesAdd
  if (result.userErrors?.length || !result.cart) throw new Error('Unable to add cart items')
  const cart = reshapeCart(result.cart)
  assertCartAccepted(cart, lines, existing)
  return cart
}

export async function removeFromCart(lineIds: string[]): Promise<Cart> {
  const cartId = await requireCartId();
  const res = await shopifyFetch<ShopifyRemoveFromCartOperation>({
    query: removeFromCartMutation,
    variables: {
      cartId,
      language: (await getLocale()) === "ar" ? "AR" : "EN",
      lineIds
    }
  });

  return reshapeCart(res.body.data.cartLinesRemove.cart);
}

export async function updateCart(
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const cartId = await requireCartId();
  await validateStock(lines.filter(line => line.quantity !== 0), await getCart(), true)
  const res = await shopifyFetch<ShopifyUpdateCartOperation>({
    query: editCartItemsMutation,
    variables: {
      cartId,
      language: (await getLocale()) === "ar" ? "AR" : "EN",
      lines
    }
  });

  const result = res.body.data.cartLinesUpdate;
  if (result.userErrors?.length || !result.cart) throw new Error("STOCK_LIMIT");
  const cart = reshapeCart(result.cart);
  for (const line of lines) {
    if ((cart.lines.find(item => item.id === line.id)?.quantity ?? 0) !== line.quantity) throw new Error("STOCK_LIMIT");
  }
  return cart;
}

export async function updateCartBuyerIdentity(
  buyerIdentity: CartBuyerIdentityInput
): Promise<{
  cart: Cart | null;
  userErrors: Array<{ field: string[]; message: string }>;
}> {
  const cartId = (await cookies()).get('cartId')?.value

  if (!cartId) {
    return {
      cart: null,
      userErrors: [{ field: ['cartId'], message: 'No cart found' }],
    }
  }

  const res = await shopifyFetch<UpdateCartBuyerIdentityOperation>({
    query: updateCartBuyerIdentityMutation,
    variables: {
      cartId,
      language: (await getLocale()) === "ar" ? "AR" : "EN",
      buyerIdentity,
    },
  })

  const payload = res.body.data.cartBuyerIdentityUpdate

  return {
    cart: payload.cart ? reshapeCart(payload.cart) : null,
    userErrors: payload.userErrors || [],
  }
}

export async function getCart(): Promise<Cart | undefined> {
  const cartId = (await cookies()).get('cartId')?.value;

  if (!cartId) {
    console.log('[Cart] No cartId cookie found');
    return undefined;
  }

  console.log('[Cart] Fetching cart with ID:', cartId.substring(0, 30) + '...');

  const res = await shopifyFetch<ShopifyCartOperation>({
    query: getCartQuery,
    variables: { cartId, language: (await getLocale()) === "ar" ? "AR" : "EN" }
  });

  // Old carts becomes `null` when you checkout.
  if (!res.body.data.cart) {
    console.log('[Cart] Cart not found or expired for ID:', cartId.substring(0, 30) + '...');
    return undefined;
  }

  // Diagnostic logging for production debugging
  const rawCart = res.body.data.cart;
  const rawLines = rawCart.lines?.edges || [];
  console.log('[Cart] Raw cart data:', {
    id: rawCart.id?.substring(0, 30) + '...',
    totalQuantity: rawCart.totalQuantity,
    lineCount: rawLines.length,
    linesWithProduct: rawLines.filter((e) => e.node?.merchandise?.product?.handle).length,
    linesWithoutProduct: rawLines.filter((e) => !e.node?.merchandise?.product?.handle).length,
  });

  return reshapeCart(res.body.data.cart);
}

// ============================================================================
// Enhanced Cart Functions with Warnings Support (Storefront API 2024-10+)
// ============================================================================

import type { CartWarning, CartUserError, CartMutationResult } from './types';
import {
  addToCartMutation as addToCartWithWarningsMutation,
  createCartMutation as createCartWithWarningsMutation,
  editCartItemsMutation as editCartWithWarningsMutation,
  removeFromCartMutation as removeFromCartWithWarningsMutation,
  updateCartBuyerIdentityMutation,
  updateCartDiscountCodesMutation,
  updateCartNoteMutation,
  updateCartAttributesMutation,
} from './mutations/cart';

/**
 * Extended result type for cart operations with warnings
 */
export type CartOperationResult = {
  cart: Cart | null;
  userErrors: CartUserError[];
  warnings: CartWarning[];
};

/**
 * Add to cart with warnings support
 * Returns cart, user errors, and warnings for inventory/discount issues
 */
export async function addToCartWithWarnings(
  lines: { merchandiseId: string; quantity: number }[]
): Promise<CartOperationResult> {
  const cartId = (await cookies()).get('cartId')?.value;

  // If no cart exists, create one with the items
  if (!cartId) {
    console.log('[Shopify] No cart found, creating new cart with items');
    return await createCartWithWarnings(lines);
  }

  const res = await shopifyFetch<{
    variables: { cartId: string; lines: { merchandiseId: string; quantity: number }[] };
    data: {
      cartLinesAdd: {
        cart: ShopifyCart;
        userErrors: CartUserError[];
        warnings: CartWarning[];
      };
    };
  }>({
    query: addToCartWithWarningsMutation,
    variables: { cartId, lines }
  });

  const { cart, userErrors = [], warnings = [] } = res.body.data.cartLinesAdd;

  return {
    cart: cart ? reshapeCart(cart) : null,
    userErrors,
    warnings,
  };
}

/**
 * Create cart with warnings support
 */
export async function createCartWithWarnings(
  lines?: { merchandiseId: string; quantity: number }[]
): Promise<CartOperationResult> {
  try {
    const res = await shopifyFetch<{
      variables: { lineItems: { merchandiseId: string; quantity: number }[] };
      data: {
        cartCreate: {
          cart: ShopifyCart;
          userErrors: CartUserError[];
          warnings: CartWarning[];
        };
      };
    }>({
      query: createCartWithWarningsMutation,
      variables: lines?.length ? { lineItems: lines } : undefined
    });

    const { cart, userErrors = [], warnings = [] } = res.body.data.cartCreate;

    // Set the cart cookie
    if (cart?.id) {
      const cookieStore = await cookies();
      cookieStore.set('cartId', cart.id);
    }

    return {
      cart: cart ? reshapeCart(cart) : null,
      userErrors,
      warnings,
    };
  } catch (error) {
    console.warn('[Shopify] Error creating cart:', error);
    return {
      cart: mockCart,
      userErrors: [],
      warnings: [],
    };
  }
}

/**
 * Update cart with warnings support
 */
export async function updateCartWithWarnings(
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<CartOperationResult> {
  const cartId = await requireCartId();

  const res = await shopifyFetch<{
    variables: { cartId: string; lines: { id: string; merchandiseId: string; quantity: number }[] };
    data: {
      cartLinesUpdate: {
        cart: ShopifyCart;
        userErrors: CartUserError[];
        warnings: CartWarning[];
      };
    };
  }>({
    query: editCartWithWarningsMutation,
    variables: { cartId, lines }
  });

  const { cart, userErrors = [], warnings = [] } = res.body.data.cartLinesUpdate;

  return {
    cart: cart ? reshapeCart(cart) : null,
    userErrors,
    warnings,
  };
}

/**
 * Remove from cart with warnings support
 */
export async function removeFromCartWithWarnings(
  lineIds: string[]
): Promise<CartOperationResult> {
  const cartId = await requireCartId();

  const res = await shopifyFetch<{
    variables: { cartId: string; lineIds: string[] };
    data: {
      cartLinesRemove: {
        cart: ShopifyCart;
        userErrors: CartUserError[];
        warnings: CartWarning[];
      };
    };
  }>({
    query: removeFromCartWithWarningsMutation,
    variables: { cartId, lineIds }
  });

  const { cart, userErrors = [], warnings = [] } = res.body.data.cartLinesRemove;

  return {
    cart: cart ? reshapeCart(cart) : null,
    userErrors,
    warnings,
  };
}

/**
 * Update cart discount codes
 */
export async function updateCartDiscountCodes(
  discountCodes: string[]
): Promise<CartOperationResult> {
  const cartId = await requireCartId();

  const res = await shopifyFetch<{
    variables: { cartId: string; discountCodes: string[] };
    data: {
      cartDiscountCodesUpdate: {
        cart: ShopifyCart;
        userErrors: CartUserError[];
        warnings: CartWarning[];
      };
    };
  }>({
    query: updateCartDiscountCodesMutation,
    variables: { cartId, discountCodes }
  });

  const { cart, userErrors = [], warnings = [] } = res.body.data.cartDiscountCodesUpdate;

  return {
    cart: cart ? reshapeCart(cart) : null,
    userErrors,
    warnings,
  };
}

/**
 * Update cart note
 */
export async function updateCartNote(
  note: string
): Promise<CartOperationResult> {
  const cartId = await requireCartId();

  const res = await shopifyFetch<{
    variables: { cartId: string; note: string };
    data: {
      cartNoteUpdate: {
        cart: ShopifyCart;
        userErrors: CartUserError[];
        warnings: CartWarning[];
      };
    };
  }>({
    query: updateCartNoteMutation,
    variables: { cartId, note }
  });

  const { cart, userErrors = [], warnings = [] } = res.body.data.cartNoteUpdate;

  return {
    cart: cart ? reshapeCart(cart) : null,
    userErrors,
    warnings,
  };
}

/**
 * Update cart attributes
 */
export async function updateCartAttributes(
  attributes: { key: string; value: string }[]
): Promise<CartOperationResult> {
  const cartId = await requireCartId();

  const res = await shopifyFetch<{
    variables: { cartId: string; attributes: { key: string; value: string }[] };
    data: {
      cartAttributesUpdate: {
        cart: ShopifyCart;
        userErrors: CartUserError[];
        warnings: CartWarning[];
      };
    };
  }>({
    query: updateCartAttributesMutation,
    variables: { cartId, attributes }
  });

  const { cart, userErrors = [], warnings = [] } = res.body.data.cartAttributesUpdate;

  return {
    cart: cart ? reshapeCart(cart) : null,
    userErrors,
    warnings,
  };
}

export async function getCollection(
  handle: string,
  locale?: { language?: string; country?: string }
): Promise<Collection | undefined> {
  const res = await shopifyFetch<ShopifyCollectionOperation>({
    query: getCollectionQuery,
    variables: {
      handle,
      ...(locale?.language && { language: locale.language.toUpperCase() }),
      ...(locale?.country && { country: locale.country.toUpperCase() })
    }
  });

  return reshapeCollection(res.body.data.collection);
}

export async function getCollectionProducts({
  collection,
  reverse,
  sortKey,
  locale
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
  locale?: { language?: string; country?: string };
}): Promise<Product[]> {
  const variables: {
    handle: string;
    reverse?: boolean;
    sortKey?: string;
    language?: string;
    country?: string;
  } = {
    handle: collection
  };

  if (reverse !== undefined) variables.reverse = reverse;
  if (sortKey) variables.sortKey = sortKey === 'CREATED_AT' ? 'CREATED' : sortKey;
  if (locale?.language) variables.language = locale.language.toUpperCase();
  if (locale?.country) variables.country = locale.country.toUpperCase();

  console.log('[Shopify] getCollectionProducts variables:', JSON.stringify(variables));

  const res = await shopifyFetch<ShopifyCollectionProductsOperation>({
    query: getCollectionProductsQuery,
    variables
  });

  if (!res.body.data.collection) {
    console.log(`No collection found for \`${collection}\``);
    return [];
  }

  // Log first product to verify handle translation
  const firstProduct = res.body.data.collection.products?.edges?.[0]?.node;
  if (firstProduct) {
    console.log('[Shopify] First product from collection:', {
      handle: firstProduct.handle,
      title: firstProduct.title,
      hasArabicHandle: /[\u0600-\u06FF]/.test(firstProduct.handle),
      hasArabicTitle: /[\u0600-\u06FF]/.test(firstProduct.title),
    });
  }

  return reshapeProducts(
    removeEdgesAndNodes(res.body.data.collection.products)
  );
}

/**
 * Get featured products from a dedicated collection with a configurable limit.
 * Use this for featured products sections where you want to manually curate products.
 * 
 * @param collection - The collection handle (default: 'featured-products')
 * @param limit - Maximum number of products to return (default: 5)
 * @param locale - Optional locale for translations
 */
export async function getFeaturedProducts({
  collection = "featured-products",
  limit = 5,
  locale
}: {
  collection?: string;
  limit?: number;
  locale?: { language?: string; country?: string };
}): Promise<Product[]> {
  try {
    const variables: {
      handle: string;
      first: number;
      language?: string;
      country?: string;
    } = {
      handle: collection,
      first: limit
    };

    if (locale?.language) variables.language = locale.language.toUpperCase();
    if (locale?.country) variables.country = locale.country.toUpperCase();

    console.log('[Shopify] getFeaturedProducts variables:', JSON.stringify(variables));

    const res = await shopifyFetch<ShopifyCollectionProductsOperation>({
      query: getFeaturedProductsQuery,
      variables
    });

    if (!res.body.data.collection) {
      console.log(`No collection found for \`${collection}\`. Make sure the collection exists in Shopify Admin.`);
      return [];
    }

    return reshapeProducts(
      removeEdgesAndNodes(res.body.data.collection.products)
    );
  } catch (error) {
    console.warn('[Shopify] getFeaturedProducts failed, returning empty array:', error);
    return [];
  }
}

export async function getCollections(
  locale?: { language?: string; country?: string }
): Promise<Collection[]> {
  try {
    const variables: Record<string, string> = {};

    if (locale?.language) variables.language = locale.language.toUpperCase();
    if (locale?.country) variables.country = locale.country.toUpperCase();

    const fetchParams: {
      query: string;
      variables?: Record<string, string>;
    } = { query: getCollectionsQuery };

    if (Object.keys(variables).length > 0) {
      fetchParams.variables = variables;
    }

    const res = await shopifyFetch<ShopifyCollectionsOperation>(fetchParams);
    const shopifyCollections = removeEdgesAndNodes(res.body?.data?.collections);
    const collections = [
      {
        handle: '',
        title: 'All',
        description: 'All products',
        seo: {
          title: 'All',
          description: 'All products'
        },
        path: '/search',
        updatedAt: new Date().toISOString()
      },
      // Filter out the `hidden` collections.
      // Collections that start with `hidden-*` need to be hidden on the search page.
      ...reshapeCollections(shopifyCollections).filter(
        (collection) => !collection.handle.startsWith('hidden') && !isEmsPromotion(collection.handle)
      )
    ];

    return collections;
  } catch (error) {
    console.warn('[Shopify] Using mock collections data due to error:', error)
    return mockCollections.filter((collection) => !isEmsPromotion(collection.handle))
  }
}

export async function getMenuItems(
  handle: string,
  locale?: { language?: string; country?: string }
): Promise<ShopifyMenuItem[]> {
  const variables: {
    handle: string;
    language?: string;
    country?: string;
  } = { handle };

  if (locale?.language) variables.language = locale.language.toUpperCase();
  if (locale?.country) variables.country = locale.country.toUpperCase();

  const res = await shopifyFetch<ShopifyMenuOperation>({
    query: getMenuQuery,
    variables
  });

  return res.body?.data?.menu?.items || [];
}

export async function getMenu(
  handle: string,
  locale?: { language?: string; country?: string }
): Promise<Menu[]> {
  const items = await getMenuItems(handle, locale);

  return items.map((item) => {
    const url = item.url || '';
    const path = url
      ? url
        .replace(domain, '')
        .replace('/pages', '')
      : '/';

    return {
      title: item.title,
      path
    };
  });
}

export async function getPage(handle: string): Promise<Page> {
  const res = await shopifyFetch<ShopifyPageOperation>({
    query: getPageQuery,
    variables: { handle }
  });

  return res.body.data.pageByHandle;
}

export async function getPages(): Promise<Page[]> {
  const res = await shopifyFetch<ShopifyPagesOperation>({
    query: getPagesQuery
  });

  return removeEdgesAndNodes(res.body.data.pages);
}

// Get shop policy from Shopify
export async function getShopPolicy(
  policyType: 'privacyPolicy' | 'refundPolicy' | 'shippingPolicy' | 'termsOfService',
  locale?: { language?: string; country?: string }
): Promise<ShopPolicy | null> {
  try {
    const variables: ShopPolicyOperation['variables'] = {
      privacyPolicy: policyType === 'privacyPolicy',
      refundPolicy: policyType === 'refundPolicy',
      shippingPolicy: policyType === 'shippingPolicy',
      termsOfService: policyType === 'termsOfService',
    };

    if (locale?.language) variables.language = locale.language.toUpperCase();
    if (locale?.country) variables.country = locale.country.toUpperCase();

    const res = await shopifyFetch<ShopPolicyOperation>({
      query: getShopPolicyQuery,
      variables
    });

    const policy = res.body.data.shop[policyType];
    return policy || null;
  } catch (error) {
    console.warn(`[Shopify] Failed to fetch ${policyType}:`, error);
    return null;
  }
}

/**
 * Get a product by handle with fallback for translated handles.
 * 
 * IMPORTANT: Shopify's Storefront API with @inContext returns translated handles
 * in product listings, but the product(handle: "...") query may not find products
 * by their translated handle. This function implements a fallback strategy:
 * 
 * 1. Try fetching by the given handle (works for most products)
 * 2. If not found and handle contains non-ASCII characters (Arabic/translated),
 *    search for the product by querying all products and matching the handle
 * 
 * This handles the edge case where Shopify's Translate & Adapt app creates
 * translated handles that don't resolve correctly in the Storefront API.
 */
export async function getProduct(
  handle: string,
  locale?: { language?: string; country?: string }
): Promise<Product | undefined> {
  const decodedHandle = decodeURIComponent(handle);
  const variables: {
    handle: string;
    language?: string;
    country?: string;
  } = { handle: decodedHandle };

  if (locale?.language) variables.language = locale.language.toUpperCase();
  if (locale?.country) variables.country = locale.country.toUpperCase();

  const res = await shopifyFetch<ShopifyProductOperation>({
    query: getProductQuery,
    variables
  });

  // If product found, return it
  if (res.body.data.product) {
    return reshapeProduct(res.body.data.product, false);
  }

  // Check if handle contains non-ASCII characters (translated handle)
  const hasNonAscii = /[^\x00-\x7F]/.test(decodedHandle);
  
  if (hasNonAscii) {
    console.log(`[Shopify] Product not found with translated handle "${decodedHandle}", attempting fallback search...`);
    
    // Fallback: Search for product by querying with the translated handle
    // The handle field in the response should match when using @inContext
    try {
      const searchRes = await shopifyFetch<ShopifyProductsOperation>({
        query: getProductsQuery,
        variables: {
          first: 250,
          language: locale?.language?.toUpperCase(),
          country: locale?.country?.toUpperCase()
        }
      });
      
      const products = removeEdgesAndNodes(searchRes.body.data.products);
      
      // Find product with matching handle (Shopify returns translated handles with @inContext)
      const matchedProduct = products.find((p) => p.handle === decodedHandle);
      
      if (matchedProduct) {
        console.log(`[Shopify] Found product via fallback search: "${matchedProduct.title}"`);
        return reshapeProduct(matchedProduct, false);
      }
      
      console.warn(`[Shopify] Product with translated handle "${decodedHandle}" not found even in fallback search`);
    } catch (error) {
      console.error('[Shopify] Fallback search failed:', error);
    }
  }

  return undefined;
}

export async function getProductRecommendations(
  productId: string,
  locale?: { language?: string; country?: string }
): Promise<Product[]> {
  const variables: {
    productId: string;
    language?: string;
    country?: string;
  } = { productId };

  if (locale?.language) variables.language = locale.language.toUpperCase();
  if (locale?.country) variables.country = locale.country.toUpperCase();

  const res = await shopifyFetch<ShopifyProductRecommendationsOperation>({
    query: getProductRecommendationsQuery,
    variables
  });

  return reshapeProducts(res.body.data.productRecommendations);
}

export async function getProducts({
  query,
  reverse,
  sortKey,
  locale
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
  locale?: { language?: string; country?: string };
}): Promise<Product[]> {
  try {
    const variables: {
      query?: string;
      reverse?: boolean;
      sortKey?: string;
      language?: string;
      country?: string;
    } = {};

    if (query) variables.query = query;
    if (reverse !== undefined) variables.reverse = reverse;
    if (sortKey) variables.sortKey = sortKey;
    if (locale?.language) variables.language = locale.language.toUpperCase();
    if (locale?.country) variables.country = locale.country.toUpperCase();

    const res = await shopifyFetch<ShopifyProductsOperation>({
      query: getProductsQuery,
      variables
    });

    return reshapeProducts(removeEdgesAndNodes(res.body.data.products));
  } catch (error) {
    console.warn('[Shopify] Using mock products data due to error:', error)
    return mockProducts.filter((product) => !isEmsPromotion(`${product.handle} ${product.title}`))
  }
}

/**
 * Get the newest products sorted by creation date (descending).
 * Uses the products query with sortKey: CREATED_AT and reverse: true.
 * Perfect for "New Arrivals" sections that automatically show the latest products.
 * 
 * @param limit - Maximum number of products to return (default: 10)
 * @param locale - Optional locale for translations
 */
export async function getNewestProducts({
  limit = 10,
  locale
}: {
  limit?: number;
  locale?: { language?: string; country?: string };
}): Promise<Product[]> {
  try {
    const variables: {
      first: number;
      sortKey: string;
      reverse: boolean;
      language?: string;
      country?: string;
    } = {
      first: limit,
      sortKey: 'CREATED_AT',
      reverse: true  // newest first
    };

    if (locale?.language) variables.language = locale.language.toUpperCase();
    if (locale?.country) variables.country = locale.country.toUpperCase();

    console.log('[Shopify] getNewestProducts variables:', JSON.stringify(variables));

    const res = await shopifyFetch<ShopifyProductsOperation>({
      query: getNewestProductsQuery,
      variables
    });

    return reshapeProducts(removeEdgesAndNodes(res.body.data.products));
  } catch (error) {
    console.warn('[Shopify] getNewestProducts failed, returning empty array:', error);
    return [];
  }
}

// This is called from `app/api/revalidate.ts` so providers can control revalidation logic.
export async function revalidate(req: NextRequest): Promise<NextResponse> {
  // We always need to respond with a 200 status code to Shopify,
  // otherwise it will continue to retry the request.
  const collectionWebhooks = [
    'collections/create',
    'collections/delete',
    'collections/update'
  ];
  const productWebhooks = [
    'products/create',
    'products/delete',
    'products/update'
  ];
  const topic = req.headers.get('x-shopify-topic') || 'unknown';
  const secret = req.nextUrl.searchParams.get('secret');
  const isCollectionUpdate = collectionWebhooks.includes(topic);
  const isProductUpdate = productWebhooks.includes(topic);

  if (!secret || secret !== process.env.SHOPIFY_REVALIDATION_SECRET) {
    console.error('Invalid revalidation secret.');
    return NextResponse.json({ status: 401 });
  }

  if (!isCollectionUpdate && !isProductUpdate) {
    // We don't need to revalidate anything for any other topics.
    return NextResponse.json({ status: 200 });
  }

  if (isCollectionUpdate) {
    revalidateTag(TAGS.collections, 'max');
  }

  if (isProductUpdate) {
    revalidateTag(TAGS.products, 'max');
  }

  return NextResponse.json({ status: 200, revalidated: true, now: Date.now() });
}

export async function getShopPaymentSettings(
  locale?: { language?: string; country?: string }
): Promise<PaymentSettings | undefined> {
  const res = await shopifyFetch<ShopifyShopPaymentSettingsOperation>({
    query: getShopPaymentSettingsQuery,
    variables: {
      ...(locale?.language && { language: locale.language.toUpperCase() }),
      ...(locale?.country && { country: locale.country.toUpperCase() })
    }
  });

  return res.body.data.shop.paymentSettings;
}
