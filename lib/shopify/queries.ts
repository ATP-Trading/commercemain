export const createCartMutation = `
  mutation cartCreate($input: CartInput, $language: LanguageCode, $country: CountryCode) @inContext(language: $language, country: $country) {
    cartCreate(input: $input) {
      userErrors { field message }
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
                  availableForSale
                  quantityAvailable
                  currentlyNotInStock
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
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!, $language: LanguageCode, $country: CountryCode) @inContext(language: $language, country: $country) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      userErrors { field message }
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
                  availableForSale
                  quantityAvailable
                  currentlyNotInStock
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
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!, $language: LanguageCode, $country: CountryCode) @inContext(language: $language, country: $country) {
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
                  availableForSale
                  quantityAvailable
                  currentlyNotInStock
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
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!, $language: LanguageCode, $country: CountryCode) @inContext(language: $language, country: $country) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      userErrors { message }
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
                  availableForSale
                  quantityAvailable
                  currentlyNotInStock
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
  query getCart($cartId: ID!, $language: LanguageCode, $country: CountryCode) @inContext(language: $language, country: $country) {
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
                  availableForSale
                  quantityAvailable
                  currentlyNotInStock
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
    $first: Int = 100
    $language: LanguageCode
    $country: CountryCode
  ) @inContext(language: $language, country: $country) {
    collection(handle: $handle) {
      products(sortKey: $sortKey, reverse: $reverse, first: $first) {
        edges {
          node {
            id
            handle
            availableForSale
            title
            description
            descriptionHtml
            options {
              id
              name
              values
            }
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
            variants(first: 250) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  quantityAvailable
                  currentlyNotInStock
                  selectedOptions {
                    name
                    value
                  }
                  price {
                    amount
                    currencyCode
                  }
                }
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
          seo {
            description
            title
          }
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
      availableForSale
      title
      description
      descriptionHtml
      options {
        id
        name
        values
      }
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
      variants(first: 250) {
        edges {
          node {
            id
            title
            availableForSale
            quantityAvailable
            currentlyNotInStock
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
          }
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
      seo {
        description
        title
      }
      tags
      updatedAt
      # Collections that include this product (for "View All" button)
      collections(first: 100) {
        edges {
          node {
            id
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
      availableForSale
      title
      description
      descriptionHtml
      options {
        id
        name
        values
      }
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
      variants(first: 250) {
        edges {
          node {
            id
            title
            availableForSale
            quantityAvailable
            currentlyNotInStock
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
          }
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
      seo {
        description
        title
      }
      tags
      updatedAt
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
                quantityAvailable
                currentlyNotInStock
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
  query getProducts(
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $query: String
    $first: Int = 100
    $language: LanguageCode
    $country: CountryCode
  ) @inContext(language: $language, country: $country) {
    products(sortKey: $sortKey, reverse: $reverse, query: $query, first: $first) {
      edges {
        node {
          id
          handle
          availableForSale
          title
          description
          descriptionHtml
          options {
            id
            name
            values
          }
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
          variants(first: 250) {
            edges {
              node {
                id
                title
                availableForSale
                quantityAvailable
                currentlyNotInStock
                selectedOptions {
                  name
                  value
                }
                price {
                  amount
                  currencyCode
                }
              }
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
          seo {
            description
            title
          }
          tags
          updatedAt
        }
      }
    }
  }
`

// Enhanced Product Query with Selling Plans and Metafields
export const getProductWithSellingPlansQuery = `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      id
      handle
      availableForSale
      title
      description
      descriptionHtml
      options {
        id
        name
        values
      }
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
      variants(first: 250) {
        edges {
          node {
            id
            title
            availableForSale
            quantityAvailable
            currentlyNotInStock
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
            sellingPlanAllocations(first: 10) {
              nodes {
                sellingPlan {
                  id
                  name
                  options {
                    name
                    value
                  }
                  priceAdjustments {
                    adjustmentValue {
                      ... on SellingPlanFixedAmountPriceAdjustment {
                        adjustmentAmount {
                          amount
                          currencyCode
                        }
                      }
                      ... on SellingPlanFixedPriceAdjustment {
                        price {
                          amount
                          currencyCode
                        }
                      }
                      ... on SellingPlanPercentagePriceAdjustment {
                        adjustmentPercentage
                      }
                    }
                    orderCount
                  }
                  recurringDeliveries
                }
              }
            }
          }
        }
      }
      sellingPlanGroups(first: 10) {
        nodes {
          name
          options {
            name
            values
          }
          sellingPlans(first: 10) {
            nodes {
              id
              name
              options {
                name
                value
              }
              priceAdjustments {
                adjustmentValue {
                  ... on SellingPlanFixedAmountPriceAdjustment {
                    adjustmentAmount {
                      amount
                      currencyCode
                    }
                  }
                  ... on SellingPlanFixedPriceAdjustment {
                    price {
                      amount
                      currencyCode
                    }
                  }
                  ... on SellingPlanPercentagePriceAdjustment {
                    adjustmentPercentage
                  }
                }
                orderCount
              }
              recurringDeliveries
            }
          }
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
      seo {
        description
        title
      }
      tags
      updatedAt
      metafields(first: 10, namespace: "custom") {
        edges {
          node {
            id
            namespace
            key
            value
            type
          }
        }
      }
    }
  }
`

// Enhanced Cart Query with Selling Plans
export const getCartWithSellingPlansQuery = `
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
            sellingPlanAllocation {
              sellingPlan {
                id
                name
                options {
                  name
                  value
                }
              }
            }
            merchandise {
              ... on ProductVariant {
                  availableForSale
                  quantityAvailable
                  currentlyNotInStock
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

// Search Query with Enhanced Filtering
export const getProductsWithFiltersQuery = `
  query getProducts(
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $query: String
    $first: Int = 100
    $after: String
    $filters: [ProductFilter!]
  ) {
    products(
      sortKey: $sortKey, 
      reverse: $reverse, 
      query: $query, 
      first: $first,
      after: $after,
      filters: $filters
    ) {
      edges {
        node {
          id
          handle
          availableForSale
          title
          description
          descriptionHtml
          options {
            id
            name
            values
          }
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
          variants(first: 250) {
            edges {
              node {
                id
                title
                availableForSale
                quantityAvailable
                currentlyNotInStock
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
          seo {
            description
            title
          }
          tags
          updatedAt
          vendor
          productType
          totalInventory
          publishedAt
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`

// Collection Query with Enhanced Filtering
export const getCollectionWithFiltersQuery = `
  query getCollectionProducts(
    $handle: String!
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $first: Int = 100
    $after: String
    $filters: [ProductFilter!]
  ) {
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
      products(
        sortKey: $sortKey, 
        reverse: $reverse, 
        first: $first,
        after: $after,
        filters: $filters
      ) {
        edges {
          node {
            id
            handle
            availableForSale
            title
            description
            descriptionHtml
            options {
              id
              name
              values
            }
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
            variants(first: 250) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  quantityAvailable
                  currentlyNotInStock
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
            seo {
              description
              title
            }
            tags
            updatedAt
            vendor
            productType
            totalInventory
            publishedAt
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
`

// Search Query for Products, Collections, and Pages
export const searchQuery = `
  query search($query: String!, $first: Int = 10) {
    search(query: $query, first: $first, types: [PRODUCT, COLLECTION, PAGE]) {
      edges {
        node {
          ... on Product {
            id
            handle
            title
            description
            featuredImage {
              url
              altText
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
          ... on Collection {
            id
            handle
            title
            description
            image {
              url
              altText
            }
          }
          ... on Page {
            id
            handle
            title
            bodySummary
          }
        }
      }
    }
  }
`

// Predictive Search Query
export const predictiveSearchQuery = `
  query predictiveSearch($query: String!, $first: Int = 10) {
    predictiveSearch(query: $query, first: $first) {
      queries {
        text
        styledText
      }
      products {
        id
        handle
        title
        featuredImage {
          url
          altText
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
      collections {
        id
        handle
        title
        image {
          url
          altText
        }
      }
      pages {
        id
        handle
        title
      }
    }
  }
`

// Featured Products Query - fetches limited products from a collection
// Used for manually curated featured products sections
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
                  quantityAvailable
                  currentlyNotInStock
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
