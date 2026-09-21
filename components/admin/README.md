# Retired membership administration

The legacy in-store admin components and their dedicated service were removed after a full import/reachability audit. The old `/[locale]/admin/membership` route remains disabled with `notFound()`; its API compatibility handlers remain non-mutating 404 responses.

This directory does not provide an administrator login. Do not restore the former client-side password/local-storage gate or treat browser state as administrative authorization.

The active customer membership flow remains in `app/[locale]/account/membership/page.tsx`, `hooks/use-membership.ts`, and `app/api/membership/status/route.ts`. The status endpoint uses the separate Shopify/Appstle entitlement implementation. These files are unchanged by this cleanup.

The historical membership services/hooks that still exist are not automatically approved for reuse. Audit their consumers and side effects separately. Removing this dashboard does not cancel any customer's membership, modify tags, or unregister existing Shopify webhooks.

For release procedure, see `docs/STOREFRONT_RELEASE_CHECKLIST.md`.
