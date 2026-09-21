# Retired custom membership error helpers

The former custom-membership error classes, validation, fallback service and renewal UI are retired. They were not part of the current storefront dependency graph. Do not restore them or grant membership from local storage.

Current boundaries are documented in [Membership architecture](../../docs/MEMBERSHIP_ARCHITECTURE.md). OAuth authentication, server-resolved membership entitlement, current pricing, cart error handling and the shared `lib/types/membership.ts` declarations are retained.

Historical implementations remain in Git history. Their removal is not a claim that live account, purchase, cancellation or refund flows have been exercised.
