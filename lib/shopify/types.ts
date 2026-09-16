export type Maybe<T> = T | null;

export type Connection<T> = {
  edges: Array<Edge<T>>;
};

export type Edge<T> = {
  node: T;
};

export type Cart = Omit<ShopifyCart, 'lines'> & {
  lines: CartItem[];
};

export type CartProduct = {
  id: string;
  handle: string;
  title: string;
  featuredImage: Image;
  // Localization fields (from product fragment)
  translations?: Array<{
    key: string;
    value: string;
    locale: string;
  }>;
  titleAr?: {
    value: string;
  };
};

// Cart attribute for custom data
export type CartAttribute = {
  key: string;
  value: string;
};

// Discount code on cart
export type CartDiscountCode = {
  code: string;
  applicable: boolean;
};

// Discount allocation on cart or line
export type CartDiscountAllocation = {
  discountedAmount: Money;
  // For automatic discounts
  title?: string;
  // For code discounts
  code?: string;
};

// Line item discount allocation
export type CartLineDiscountAllocation = {
  discountedAmount: Money;
};

export type CartItem = {
  id: string | undefined;
  quantity: number;
  attributes?: CartAttribute[];
  cost: {
    amountPerQuantity?: Money;
    compareAtAmountPerQuantity?: Money;
    subtotalAmount?: Money;
    totalAmount: Money;
  };
  discountAllocations?: CartLineDiscountAllocation[];
  merchandise: {
    id: string;
    title: string;
    sku?: string;
    quantityAvailable?: number | null;
    availableForSale?: boolean;
    currentlyNotInStock?: boolean;
    compareAtPrice?: Money;
    selectedOptions: {
      name: string;
      value: string;
    }[];
    image?: Image;
    product: CartProduct;
  };
};

export type Collection = ShopifyCollection & {
  path: string;
};

export type Image = {
  id?: string;
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type Menu = {
  title: string;
  path: string;
};

export type ShopifyMenuItemResource =
  | {
    __typename: 'Collection';
    handle: string;
    title: string;
  }
  | {
    __typename: 'Product';
    handle: string;
    title: string;
  }
  | {
    __typename: 'Page';
    handle: string;
    title: string;
  }
  | {
    __typename: 'Article';
    handle: string;
    title: string;
  }
  | {
    __typename: 'Blog';
    handle: string;
    title: string;
  }
  | {
    __typename: 'ShopPolicy';
    handle: string;
    title: string;
  }
  | {
    __typename: 'Metaobject';
    handle: string;
    type: string;
  }
  | {
    __typename: string;
  }
  | null;

export type ShopifyMenuItem = {
  id: string;
  title: string;
  url: string | null;
  type: string;
  tags: string[];
  resourceId: string | null;
  resource?: ShopifyMenuItemResource;
  items: ShopifyMenuItem[];
};

export type Money = {
  amount: string;
  currencyCode: string;
};

export type Page = {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  seo?: SEO;
  createdAt: string;
  updatedAt: string;
};

export type Product = Omit<ShopifyProduct, 'variants' | 'images'> & {
  variants: ProductVariant[];
  images: Image[];
};

export type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type ProductVariant = {
  quantityAvailable?: number | null;
  currentlyNotInStock?: boolean;
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: Money;
};

export type SEO = {
  title: string;
  description: string;
};

export type ShopifyCart = {
  id: string | undefined;
  checkoutUrl: string;
  createdAt?: string;
  updatedAt?: string;
  note?: string;
  attributes?: CartAttribute[];
  buyerIdentity?: CartBuyerIdentity;
  cost: {
    subtotalAmount: Money;
    subtotalAmountEstimated?: boolean;
    totalAmount: Money;
    totalAmountEstimated?: boolean;
    checkoutChargeAmount?: Money;
    // NOTE: totalTaxAmount removed in Storefront API 2025-01
    // Tax is now calculated at checkout only
  };
  discountCodes?: CartDiscountCode[];
  discountAllocations?: CartDiscountAllocation[];
  lines: Connection<CartItem>;
  totalQuantity: number;
};

export type ShopifyCollection = {
  handle: string;
  title: string;
  description: string;
  seo: SEO;
  updatedAt: string;
  image?: Image;
};

export type ShopifyProduct = {
  id: string;
  handle: string;
  availableForSale: boolean;
  title: string;
  description: string;
  descriptionHtml: string;
  options: ProductOption[];
  priceRange: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  };
  productType?: string;
  variants: Connection<ProductVariant>;
  featuredImage: Image;
  images: Connection<Image>;
  seo: SEO;
  tags: string[];
  updatedAt: string;
  // Native Shopify translations (from translations query)
  translations?: Array<{
    key: string;
    value: string;
    locale: string;
  }>;
  // Arabic metafields (fallback)
  titleAr?: {
    value: string;
  };
  descriptionAr?: {
    value: string;
  };
  descriptionHtmlAr?: {
    value: string;
  };
  // Collections that include this product
  collections?: Connection<{
    id?: string;
    handle: string;
    title: string;
  }>;
};

export type ShopifyCartOperation = {
  data: {
    cart: ShopifyCart;
  };
  variables: {
    language?: string;
    cartId: string;
  };
};

export type ShopifyCreateCartOperation = {
  data: { cartCreate: { cart: ShopifyCart; userErrors?: { message: string }[] } };
};

export type ShopifyAddToCartOperation = {
  data: {
    cartLinesAdd: {
      cart: ShopifyCart;
      userErrors?: { message: string }[];
    };
  };
  variables: {
    language?: string;
    cartId: string;
    lines: {
      merchandiseId: string;
      quantity: number;
    }[];
  };
};

export type ShopifyRemoveFromCartOperation = {
  data: {
    cartLinesRemove: {
      cart: ShopifyCart;
    };
  };
  variables: {
    language?: string;
    cartId: string;
    lineIds: string[];
  };
};

export type ShopifyUpdateCartOperation = {
  data: {
    cartLinesUpdate: {
      userErrors?: { message: string }[];
      cart: ShopifyCart;
    };
  };
  variables: {
    language?: string;
    cartId: string;
    lines: {
      id: string;
      merchandiseId: string;
      quantity: number;
    }[];
  };
};

export type ShopifyCollectionOperation = {
  data: {
    collection: ShopifyCollection;
  };
  variables: {
    handle: string;
  };
};

export type ShopifyCollectionProductsOperation = {
  data: {
    collection: {
      products: Connection<ShopifyProduct>;
    };
  };
  variables: {
    handle: string;
    reverse?: boolean;
    sortKey?: string;
  };
};

export type ShopifyCollectionsOperation = {
  data: {
    collections: Connection<ShopifyCollection>;
  };
  variables: {
    language?: string;
    country?: string;
  };
};

export type ShopifyMenuOperation = {
  data: {
    menu?: {
      handle: string;
      title: string;
      items: ShopifyMenuItem[];
    };
  };
  variables: {
    handle: string;
  };
};

export type ShopifyPageOperation = {
  data: { pageByHandle: Page };
  variables: { handle: string };
};

export type ShopifyPagesOperation = {
  data: {
    pages: Connection<Page>;
  };
};

export type ShopifyProductOperation = {
  data: { product: ShopifyProduct };
  variables: {
    handle: string;
  };
};

export type ShopifyProductRecommendationsOperation = {
  data: {
    productRecommendations: ShopifyProduct[];
  };
  variables: {
    productId: string;
  };
};

export type ShopifyProductsOperation = {
  data: {
    products: Connection<ShopifyProduct>;
  };
  variables: {
    query?: string;
    reverse?: boolean;
    sortKey?: string;
    first?: number;
    language?: string;
    country?: string;
  };
};

// ============================================================================
// New Shopify Storefront API 2026-01 Types
// ============================================================================

// Localization Types
export type Country = {
  isoCode: string;
  name: string;
  currency: Currency;
  unitSystem: 'IMPERIAL' | 'METRIC';
};

export type Currency = {
  isoCode: string;
  name: string;
  symbol: string;
};

export type Language = {
  isoCode: string;
  name: string;
  endonymName: string;
};

export type Market = {
  id: string;
  handle: string;
};

export type Localization = {
  country: Country;
  language: Language;
  market: Market;
  availableCountries: Country[];
  availableLanguages: Language[];
};

export type LocalizationOperation = {
  data: {
    localization: Localization;
  };
  variables: {
    language?: string;
    country?: string;
  };
};

export type AvailableCountriesOperation = {
  data: {
    localization: {
      availableCountries: Country[];
    };
  };
  variables: {
    language?: string;
  };
};

export type AvailableLanguagesOperation = {
  data: {
    localization: {
      availableLanguages: Language[];
    };
  };
};

// Buyer Identity Types
export type MailingAddress = {
  address1?: string;
  address2?: string;
  city?: string;
  provinceCode?: string;
  countryCodeV2?: string;
  zip?: string;
};

export type CartBuyerIdentity = {
  email?: string;
  phone?: string;
  countryCode?: string;
  customer?: {
    id: string;
    email: string;
    displayName: string;
  };
  deliveryAddressPreferences?: MailingAddress[];
};

export type CartBuyerIdentityInput = {
  email?: string | null;
  phone?: string | null;
  countryCode?: string;
  customerAccessToken?: string | null;
  deliveryAddressPreferences?: MailingAddress[];
};

export type UpdateCartBuyerIdentityOperation = {
  data: {
    cartBuyerIdentityUpdate: {
      cart: ShopifyCart & { buyerIdentity?: CartBuyerIdentity };
      userErrors: Array<{
        field: string[];
        message: string;
      }>;
    };
  };
  variables: {
    cartId: string;
    buyerIdentity: CartBuyerIdentityInput;
    language?: string;
    country?: string;
  };
};

// Metafield Types
export type Metafield = {
  namespace: string;
  key: string;
  value: string;
  type: string;
  reference?: {
    image?: Image;
    id?: string;
  };
};

export type CardBrand =
  | 'VISA'
  | 'MASTERCARD'
  | 'DISCOVER'
  | 'AMERICAN_EXPRESS'
  | 'DINERS_CLUB'
  | 'JCB'
  | 'UNIONPAY'
  | 'MAESTRO'
  | 'PAYPAL'; // Add others as needed based on Shopify Enum

export type DigitalWallet =
  | 'APPLE_PAY'
  | 'GOOGLE_PAY'
  | 'SHOPIFY_PAY'
  | 'PAYPAL'; // Add others as needed

export type PaymentSettings = {
  currencyCode: string;
  countryCode: string;
  enabledPresentmentCurrencies: string[];
  acceptedCardBrands: CardBrand[];
  supportedDigitalWallets: DigitalWallet[];
};

export type ShopifyShopPaymentSettingsOperation = {
  data: {
    shop: {
      paymentSettings: PaymentSettings;
    };
  };
};

export type MetafieldIdentifier = {
  namespace: string;
  key: string;
};

// Store Availability Types
export type StoreLocation = {
  id: string;
  name: string;
  isActive?: boolean;
  address: {
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    country?: string;
    zip?: string;
    phone?: string;
  };
  metafield?: Metafield;
  storeHours?: Metafield;
  storeServices?: Metafield;
};

export type StoreAvailability = {
  available: boolean;
  location: StoreLocation;
};

export type StoreAvailabilityOperation = {
  data: {
    product: {
      id: string;
      handle: string;
      title: string;
      variants: Connection<{
        id: string;
        title: string;
        storeAvailability: Connection<StoreAvailability>;
      }>;
    };
  };
  variables: {
    productId: string;
    language?: string;
    country?: string;
  };
};

export type VariantStoreAvailabilityOperation = {
  data: {
    productVariant: {
      id: string;
      title: string;
      storeAvailability: Connection<StoreAvailability>;
    };
  };
  variables: {
    variantId: string;
    language?: string;
    country?: string;
  };
};

export type StoreLocationsOperation = {
  data: {
    locations: Connection<StoreLocation>;
  };
  variables: {
    language?: string;
    country?: string;
  };
};

// Metaobject Types
export type MetaobjectField = {
  key: string;
  value: string;
  type: string;
  reference?: {
    image?: Image;
    id?: string;
    handle?: string;
    title?: string;
  };
  references?: Connection<{
    image?: Image;
    id?: string;
    handle?: string;
    title?: string;
  }>;
};

export type Metaobject = {
  id: string;
  handle: string;
  type: string;
  fields: MetaobjectField[];
};

export type MetaobjectOperation = {
  data: {
    metaobject: Metaobject;
  };
  variables: {
    handle: string;
    type: string;
    language?: string;
    country?: string;
  };
};

export type MetaobjectsOperation = {
  data: {
    metaobjects: Connection<Metaobject>;
  };
  variables: {
    type: string;
    first?: number;
    language?: string;
    country?: string;
  };
};

// ATP Membership Tier from Metaobjects
export type ATPMembershipTier = {
  id: string;
  handle: string;
  name: string;
  discountPercentage: number;
  freeDelivery: boolean;
  prioritySupport: boolean;
  exclusiveAccess: boolean;
  annualFee: string;
  description: string;
  descriptionAr?: string;
  benefits: string[];
  icon?: Image;
};

// Homepage Banner from Metaobjects
export type HomepageBanner = {
  id: string;
  handle: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  image?: Image;
  link?: string;
  ctaText: string;
  ctaTextAr?: string;
  active: boolean;
  position: number;
};

// FAQ from Metaobjects
export type FAQ = {
  id: string;
  handle: string;
  question: string;
  questionAr?: string;
  answer: string;
  answerAr?: string;
  category: string;
  position: number;
  featured: boolean;
};

// ============================================================================
// Cart Warnings (Added in Storefront API 2024-10)
// ============================================================================

/**
 * Cart Warning Code - Possible warning codes from cart mutations
 * These indicate automatic changes made to the cart, not failures
 * 
 * @see https://shopify.dev/docs/api/storefront/latest/enums/CartWarningCode
 */
export type CartWarningCode =
  // Inventory warnings
  | 'MERCHANDISE_OUT_OF_STOCK'
  | 'MERCHANDISE_NOT_ENOUGH_STOCK'
  // Discount warnings  
  | 'DISCOUNT_CODE_NOT_HONOURED'
  | 'DISCOUNT_CURRENTLY_INACTIVE'
  | 'DISCOUNT_CUSTOMER_NOT_ELIGIBLE'
  | 'DISCOUNT_CUSTOMER_USAGE_LIMIT_REACHED'
  | 'DISCOUNT_ELIGIBLE_CUSTOMER_MISSING'
  | 'DISCOUNT_INCOMPATIBLE_PURCHASE_TYPE'
  | 'DISCOUNT_NO_ENTITLED_LINE_ITEMS'
  | 'DISCOUNT_NO_ENTITLED_SHIPPING_LINES'
  | 'DISCOUNT_NOT_FOUND'
  | 'DISCOUNT_PURCHASE_NOT_IN_RANGE'
  | 'DISCOUNT_QUANTITY_NOT_IN_RANGE'
  | 'DISCOUNT_USAGE_LIMIT_REACHED'
  // Address warnings
  | 'DUPLICATE_DELIVERY_ADDRESS'
  // B2B warnings
  | 'MERCHANDISE_SELLING_PLAN_NOT_APPLICABLE_ON_COMPANY_LOCATION'
  // Payment warnings
  | 'PAYMENTS_GIFT_CARDS_UNAVAILABLE';

/**
 * Cart Warning - A warning that occurred during a cart mutation
 * Unlike userErrors, warnings indicate success with automatic changes
 * 
 * @see https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/cart-warnings
 */
export type CartWarning = {
  /** The warning code */
  code: CartWarningCode;
  /** Localized message describing the warning */
  message: string;
  /** ID of the targeted object (e.g., cart line ID) */
  target: string;
};

/**
 * Cart User Error - An error that occurred during a cart mutation
 */
export type CartUserError = {
  code?: string;
  field?: string[];
  message: string;
};

/**
 * Cart Mutation Result - Extended result type including warnings
 */
export type CartMutationResult = {
  cart: ShopifyCart | null;
  userErrors?: CartUserError[];
  warnings?: CartWarning[];
};

/**
 * Helper function to categorize warnings by severity
 */
export type CartWarningCategory = 'inventory' | 'discount' | 'address' | 'payment' | 'other';

export const getWarningCategory = (code: CartWarningCode): CartWarningCategory => {
  if (code.startsWith('MERCHANDISE_')) return 'inventory';
  if (code.startsWith('DISCOUNT_')) return 'discount';
  if (code.startsWith('DUPLICATE_DELIVERY')) return 'address';
  if (code.startsWith('PAYMENTS_')) return 'payment';
  return 'other';
};

// Shop Policy Types
export type ShopPolicy = {
  body: string;
  handle: string;
  id: string;
  title: string;
  url: string;
};

export type ShopPolicyType = 'privacyPolicy' | 'refundPolicy' | 'shippingPolicy' | 'termsOfService';

export type ShopPolicyOperation = {
  data: {
    shop: {
      privacyPolicy?: ShopPolicy;
      refundPolicy?: ShopPolicy;
      shippingPolicy?: ShopPolicy;
      termsOfService?: ShopPolicy;
    };
  };
  variables: {
    privacyPolicy: boolean;
    refundPolicy: boolean;
    shippingPolicy: boolean;
    termsOfService: boolean;
    country?: string;
    language?: string;
  };
};
