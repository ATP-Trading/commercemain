import imageFragment from './image';
import seoFragment from './seo';

const productFragment = /* GraphQL */ `
  fragment product on Product {
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
      ...image
    }
    images(first: 20) {
      edges {
        node {
          ...image
        }
      }
    }
    seo {
      ...seo
    }
    tags
    updatedAt
    
    # Enhanced metafields using identifiers for better performance
    metafields(identifiers: [
      # Internationalization metafields
      { namespace: "i18n", key: "title_ar" },
      { namespace: "i18n", key: "description_ar" },
      { namespace: "i18n", key: "description_html_ar" },
      # Product specifications
      { namespace: "custom", key: "features" },
      { namespace: "custom", key: "specifications" },
      { namespace: "custom", key: "material" },
      { namespace: "custom", key: "care_instructions" },
      # Reviews and ratings
      { namespace: "custom", key: "rating" },
      { namespace: "custom", key: "review_count" },
      # ATP Membership specific
      { namespace: "custom", key: "atp_exclusive" },
      { namespace: "custom", key: "atp_discount_eligible" }
    ]) {
      namespace
      key
      value
      type
      reference {
        ... on MediaImage {
          id
          image {
            url
            altText
            width
            height
          }
        }
      }
    }
    
    # Legacy metafield accessors for backward compatibility
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
  ${imageFragment}
  ${seoFragment}
`;

export default productFragment;
