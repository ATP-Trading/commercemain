import productFragment from './product';

/**
 * Cart Fragment - Updated for Shopify Storefront API 2025-01+
 * 
 * Changes from previous version:
 * - REMOVED: totalTaxAmount (deprecated in 2025-01, tax now calculated at checkout)
 * - ADDED: discountCodes, discountAllocations for discount support
 * - ADDED: buyerIdentity for customer context
 * - ADDED: note and attributes for cart customization
 * - ADDED: createdAt, updatedAt for tracking
 * - ENHANCED: cost fields with subtotalAmountEstimated, totalAmountEstimated
 * - ENHANCED: line item cost with amountPerQuantity, compareAtAmountPerQuantity
 * - ENHANCED: merchandise with sku, quantityAvailable, compareAtPrice
 */
const cartFragment = /* GraphQL */ `
  fragment cart on Cart {
    id
    checkoutUrl
    createdAt
    updatedAt
    note
    attributes {
      key
      value
    }
    buyerIdentity {
      email
      phone
      countryCode
      customer {
        id
        email
        displayName
      }
    }
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      subtotalAmountEstimated
      totalAmount {
        amount
        currencyCode
      }
      totalAmountEstimated
      checkoutChargeAmount {
        amount
        currencyCode
      }
    }
    discountCodes {
      code
      applicable
    }
    discountAllocations {
      discountedAmount {
        amount
        currencyCode
      }
      ... on CartAutomaticDiscountAllocation {
        title
      }
      ... on CartCodeDiscountAllocation {
        code
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          attributes {
            key
            value
          }
          cost {
            amountPerQuantity {
              amount
              currencyCode
            }
            compareAtAmountPerQuantity {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
            totalAmount {
              amount
              currencyCode
            }
          }
          discountAllocations {
            discountedAmount {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              sku
              quantityAvailable
              compareAtPrice {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
              image {
                url
                altText
                width
                height
              }
              product {
                ...product
              }
            }
          }
        }
      }
    }
    totalQuantity
  }
  ${productFragment}
`;

export default cartFragment;
