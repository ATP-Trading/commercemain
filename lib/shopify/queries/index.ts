export const createCartMutation = `
  mutation cartCreate {
    cartCreate {
      cart {
        id
        checkoutUrl
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  selectedOptions {
                    name
                    value
                  }
                  product {
                    id
                    handle
                    title
                    featuredImage {
                      id
                      altText
                      url
                      width
                      height
                    }
                  }
                }
              }
            }
          }
        }
        totalQuantity
      }
    }
  }
`

export const addToCartMutation = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  selectedOptions {
                    name
                    value
                  }
                  product {
                    id
                    handle
                    title
                    featuredImage {
                      id
                      altText
                      url
                      width
                      height
                    }
                  }
                }
              }
            }
          }
        }
        totalQuantity
      }
    }
  }
`

export const removeFromCartMutation = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        checkoutUrl
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  selectedOptions {
                    name
                    value
                  }
                  product {
                    id
                    handle
                    title
                    featuredImage {
                      id
                      altText
                      url
                      width
                      height
                    }
                  }
                }
              }
            }
          }
        }
        totalQuantity
      }
    }
  }
`

export const editCartItemsMutation = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  selectedOptions {
                    name
                    value
                  }
                  product {
                    id
                    handle
                    title
                    featuredImage {
                      id
                      altText
                      url
                      width
                      height
                    }
                  }
                }
              }
            }
          }
        }
        totalQuantity
      }
    }
  }
`

export const getCartQuery = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      cost {
        totalAmount {
          amount
          currencyCode
        }
        subtotalAmount {
          amount
          currencyCode
        }
      }
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            cost {
              totalAmount {
                amount
                currencyCode
              }
            }
            merchandise {
              ... on ProductVariant {
                id
                title
                selectedOptions {
                  name
                  value
                }
                product {
                  id
                  handle
                  title
                  featuredImage {
                    id
                    altText
                    url
                    width
                    height
                  }
                }
              }
            }
          }
        }
      }
      totalQuantity
    }
  }
`

export const getCollectionQuery = `
  query getCollection($handle: String!, $language: LanguageCode, $country: CountryCode) @inContext(language: $language, country: $country) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      seo {
        description
        title
      }
      updatedAt
      image {
        url
        altText
        width
        height
      }
    }
  }
`

export const getCollectionProductsQuery = `
  query getCollectionProducts(
    $handle: String!
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $language: LanguageCode
    $country: CountryCode
  ) @inContext(language: $language, country: $country) {
    collection(handle: $handle) {
      products(first: 100, sortKey: $sortKey, reverse: $reverse) {
        edges {
          node {
            id
            handle
            title
            description
            tags
            priceRange {
              maxVariantPrice {
                amount
                currencyCode
              }
              minVariantPrice {
                amount
                currencyCode
              }
            }
            featuredImage {
              id
              altText
              url
              width
              height
            }
            images(first: 20) {
              edges {
                node {
                  id
                  altText
                  url
                  width
                  height
                }
              }
            }
            variants(first: 250) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  selectedOptions {
                    name
                    value
                  }
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
            seo {
              description
              title
            }
            tags
            updatedAt
            # Collections that include this product (for "View All" button)
            collections(first: 1) {
              edges {
                node {
                  handle
                  title
                }
              }
            }
          }
        }
      }
    }
  }
`

export const getCollectionsQuery = `
  query getCollections($language: LanguageCode, $country: CountryCode) @inContext(language: $language, country: $country) {
    collections(first: 100, sortKey: TITLE) {
      edges {
        node {
          id
          handle
          title
          description
          seo {
            description
            title
          }
          updatedAt
        }
      }
    }
  }
`

export const getMenuQuery = `
  fragment MenuItemFields on MenuItem {
    id
    title
    url
    type
    tags
    resourceId
    resource {
      __typename
      ... on Collection {
        handle
        title
      }
      ... on Product {
        handle
        title
      }
      ... on Page {
        handle
        title
      }
      ... on Article {
        handle
        title
      }
      ... on Blog {
        handle
        title
      }
      ... on ShopPolicy {
        handle
        title
      }
      ... on Metaobject {
        handle
        type
      }
    }
  }

  query getMenu($handle: String!, $language: LanguageCode, $country: CountryCode) @inContext(language: $language, country: $country) {
    menu(handle: $handle) {
      handle
      title
      items {
        ...MenuItemFields
        items {
          ...MenuItemFields
          items {
            ...MenuItemFields
          }
        }
      }
    }
  }
`

export const getPageQuery = `
  query getPage($handle: String!) {
    pageByHandle(handle: $handle) {
      id
      title
      handle
      body
      bodySummary
      seo {
        description
        title
      }
      createdAt
      updatedAt
    }
  }
`

export const getPagesQuery = `
  query getPages {
    pages(first: 100) {
      edges {
        node {
          id
          title
          handle
          bodySummary
          createdAt
          updatedAt
        }
      }
    }
  }
`

export const getProductQuery = `
  query getProduct($handle: String!, $language: LanguageCode, $country: CountryCode) @inContext(language: $language, country: $country) {
    product(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      tags
      priceRange {
        maxVariantPrice {
          amount
          currencyCode
        }
        minVariantPrice {
          amount
          currencyCode
        }
      }
      featuredImage {
        id
        altText
        url
        width
        height
      }
      images(first: 20) {
        edges {
          node {
            id
            altText
            url
            width
            height
          }
        }
      }
      variants(first: 250) {
        edges {
          node {
            id
            title
            availableForSale
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
          }
        }
      }
      seo {
        description
        title
      }
      updatedAt
      createdAt
      # Arabic metafield fallbacks
      titleAr: metafield(namespace: "i18n", key: "title_ar") {
        value
      }
      descriptionAr: metafield(namespace: "i18n", key: "description_ar") {
        value
      }
      descriptionHtmlAr: metafield(namespace: "i18n", key: "description_html_ar") {
        value
      }
      # Collections that include this product (for "View All" button)
      collections(first: 1) {
        edges {
          node {
            handle
            title
          }
        }
      }
    }
  }
`

export const getProductRecommendationsQuery = `
  query getProductRecommendations($productId: ID!, $language: LanguageCode, $country: CountryCode) @inContext(language: $language, country: $country) {
    productRecommendations(productId: $productId) {
      id
      handle
      title
      description
      tags
      priceRange {
        maxVariantPrice {
          amount
          currencyCode
        }
        minVariantPrice {
          amount
          currencyCode
        }
      }
      featuredImage {
        id
        altText
        url
        width
        height
      }
      images(first: 20) {
        edges {
          node {
            id
            altText
            url
            width
            height
          }
        }
      }
      variants(first: 250) {
        edges {
          node {
            id
            title
            availableForSale
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`

// Query for fetching limited products from a collection (e.g., featured products)
export const getFeaturedProductsQuery = `
  query getFeaturedProducts(
    $handle: String!
    $first: Int!
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $language: LanguageCode
    $country: CountryCode
  ) @inContext(language: $language, country: $country) {
    collection(handle: $handle) {
      products(first: $first, sortKey: $sortKey, reverse: $reverse) {
        edges {
          node {
            id
            handle
            title
            description
            tags
            priceRange {
              maxVariantPrice {
                amount
                currencyCode
              }
              minVariantPrice {
                amount
                currencyCode
              }
            }
            featuredImage {
              id
              altText
              url
              width
              height
            }
            images(first: 20) {
              edges {
                node {
                  id
                  altText
                  url
                  width
                  height
                }
              }
            }
            variants(first: 250) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  selectedOptions {
                    name
                    value
                  }
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

// Query for fetching newest products sorted by creation date (for New Arrivals)
export const getNewestProductsQuery = `
  query getNewestProducts(
    $first: Int!
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $language: LanguageCode
    $country: CountryCode
  ) @inContext(language: $language, country: $country) {
    products(first: $first, sortKey: $sortKey, reverse: $reverse) {
      edges {
        node {
          id
          handle
          title
          description
          tags
          createdAt
          priceRange {
            maxVariantPrice {
              amount
              currencyCode
            }
            minVariantPrice {
              amount
              currencyCode
            }
          }
          featuredImage {
            id
            altText
            url
            width
            height
          }
          images(first: 5) {
            edges {
              node {
                id
                altText
                url
                width
                height
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                availableForSale
                selectedOptions {
                  name
                  value
                }
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`

export const getProductsQuery = `
  query getProducts($sortKey: ProductSortKeys, $reverse: Boolean, $query: String, $language: LanguageCode, $country: CountryCode) @inContext(language: $language, country: $country) {
    products(first: 100, sortKey: $sortKey, reverse: $reverse, query: $query) {
      edges {
        node {
          id
          handle
          title
          description
          tags
          priceRange {
            maxVariantPrice {
              amount
              currencyCode
            }
            minVariantPrice {
              amount
              currencyCode
            }
          }
      featuredImage {
            id
            altText
            url
            width
            height
          }
          images(first: 20) {
            edges {
              node {
                id
                altText
                url
                width
                height
              }
            }
          }
          variants(first: 250) {
            edges {
              node {
                id
                title
                availableForSale
                selectedOptions {
                  name
                  value
                }
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`
