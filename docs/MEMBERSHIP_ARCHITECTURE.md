# Current storefront membership boundary

## Active and retained

- `hooks/use-customer-oauth.ts` and `lib/shopify/customer-account-oauth.ts`: customer session and authentication.
- `app/api/membership/status/route.ts`: resolve only the authenticated customer; do not trust a customer ID or membership flag from browser storage.
- `lib/shopify/membership-entitlement.ts` and `lib/shopify/appstle-membership.ts`: Appstle subscriptions and explicit merchant grants.
- `hooks/use-membership.ts`: load the current server-owned entitlement for the session.
- `hooks/use-storefront-membership-pricing.ts`: display estimates, not an alternative checkout price authority.
- `lib/shopify/membership-purchase.ts`, `lib/shopify/server.ts`, current cart actions and current account membership page: keep existing purchase/account behavior. Shopify remains authoritative for checkout totals.
- Shared `lib/constants/membership.ts`, `lib/types/membership.ts`, current membership display widgets, root EN/AR translations and payment declarations are unchanged.

## Retired custom subsystem

The former custom membership creation/renewal/cancellation engine, timers/cron workers, notification/webhook services, local-storage membership context, parallel cart wrappers and their exclusive test suites are retired. The exact file inventory is in `__tests__/__mocks__/retired-membership-files.json`.

Retired public API paths still return their existing stopped responses, and old membership page URLs retain their existing redirects. No route is deleted by this cleanup. The compatibility maintenance commands from the previous cleanup continue to fail closed. No external Shopify webhook, metafield, subscription, discount, customer record or merchant environment setting is changed. Source reachability is not an audit of externally configured jobs.

## Verification limits

Existing active-session, entitlement, cart, translation, analytics and accessibility tests remain. Three stale mocks for removed modules are cleaned up; the retained assertions continue to exercise current behavior. Exclusive tests of removed implementations are retired with them, not counted as repaired or newly passing tests. The obsolete performance/load aliases and corresponding runner entries are removed because their only suites targeted the deleted custom engine. This is not a new storefront load/performance certification.

The shared type declarations and display constants are intentionally retained even where they include historical fields. Never remove a shared definition merely because its name resembles the old subsystem.

## Publication gate

This cleanup does not resolve the intermittent raw-browser React #418 observation recorded under PR #36. Keep that observation open, validate the final combined candidate, and follow [the storefront release checklist](STOREFRONT_RELEASE_CHECKLIST.md). No merge or Production promotion is authorized by a passing build alone.
