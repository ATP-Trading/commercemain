export const sitemapProductsQuery = /* GraphQL */ `
  query SitemapProducts($after: String, $language: LanguageCode!)
  @inContext(language: $language, country: AE) {
    products(first: 250, after: $after, sortKey: ID) {
      nodes { id handle title tags updatedAt }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

export const sitemapCollectionsQuery = /* GraphQL */ `
  query SitemapCollections($after: String, $language: LanguageCode!)
  @inContext(language: $language, country: AE) {
    collections(first: 250, after: $after, sortKey: ID) {
      nodes { id handle title updatedAt }
      pageInfo { hasNextPage endCursor }
    }
  }
`;
