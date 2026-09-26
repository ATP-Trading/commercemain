# Verified product reviews

Production integration uses Shopify product JSON metafield
`atp_reviews.verified_reviews_v1`. Its merchant-owned definition permits the
ATP infrastructure app and merchant tooling to manage the same data. Definition
ID: `gid://shopify/MetafieldDefinition/260918706414`. Storefront and Customer
Account access are both NONE. Never make this field publicly readable: buyer IDs
and moderation history are private. Public API explicitly selects public fields.

`PRODUCT_REVIEWS_ENABLED=true` and `REVIEW_OWNER_CUSTOMER_ID` (server-only exact
Shopify customer GID) are required. Existing ATP Admin client credentials require
read_products/write_products; existing Customer Account OAuth verifies identity
and accesses the customer's order. No additional paid storage or app is required.

One review per buyer per product, including hidden reviews. Only customer-owned
orders containing the product qualify; Customer Account API enforces ownership.
Refunds do not suppress legitimate reviews. No star-based screening. Plain text,
bounded payloads, same-origin POSTs, protected owner endpoints, no-store responses.
Concurrent updates use compareDigest and retry STALE_OBJECT, preserving duplicates
and moderation history correctly. Limit: 200 reviews and 100 KB total per product;
capacity errors fail closed and require migration rather than dropping old data.
Moderation history has no silent truncation. Hide removes the review from public
list/average and is reversible. Owner URL: /ar/admin/reviews or /en/admin/reviews.

Local prototype under scripts/reviews-preview is separate, uses synthetic data,
and must never be deployed as a service. No test reviews are copied to Shopify.

Disable feature with PRODUCT_REVIEWS_ENABLED=false and redeploy to hide it while
retaining all stored data. Restore the prior deployment if release verification
fails. Do not revoke the infrastructure application's other existing scopes.

Validation: __tests__/reviews/reviews.test.ts covers auth, private-field omission,
negative ratings, hiding/restoration, duplicate prevention, origin and body limits,
purchase-product checks, order-line pagination, CAS conflicts and corrupt storage.
