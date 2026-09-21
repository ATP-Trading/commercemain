# Storefront release checklist

This is the current code-release procedure, not an instruction to modify merchant data. The older deployment guides/runbook in this directory describe the retired custom membership system and are historical references only.

## Authoritative membership path

- Customer account: `app/[locale]/account/membership/page.tsx` and `hooks/use-membership.ts`.
- Status endpoint: `app/api/membership/status/route.ts`.
- Entitlement resolution: `lib/shopify/membership-entitlement.ts` and `lib/shopify/appstle-membership.ts`.
- Preserve live OAuth, discounts, cart/checkout, current EN/AR catalogs and payment widgets unless a separately reviewed change explicitly requires otherwise.

Do not restart old membership schedulers, build a second entitlement source, or use the retired admin password/local-storage gate. The compatibility admin/webhook/cron handlers remain stopped. Existing Shopify subscriptions, metadata and Appstle settings are not changed by code-file retirement.

## Retired command behavior

The existing `deploy:validate`, `setup:shopify:metafields` and `setup:shopify:webhooks` aliases and direct script paths now print a retirement notice and exit with status 1. They read no credentials, make no requests and write no deployment summary. A retired command must not report that a deployment succeeded.

Eleven aliases to absent maintenance scripts were removed rather than replaced by guessed implementations. The old `health:check` alias was also removed because it requested a retired 404 endpoint; there is no replacement whole-store health certificate.

## Before any production merge

1. Pin the candidate commit, check the actual diff and all stacked PR dependencies. Recheck the current `master` and Production deployment; do not merge intermediate incompatible states just to close the PR stack.
2. Install the existing lockfile with lifecycle scripts disabled in the isolated validation environment. Run `tsc --noEmit --incremental false`, the audited regression scope, changed suites in randomized order, and a production-mode Preview build. Record exact tests, exclusions, source SHA and outcomes. Selected tests do not imply the entire repository passed.
3. Verify the exact deployed Preview in EN/AR: desktop/mobile menus, search, product/collection pages, language switching, customer entry and membership links. Capture console and recoverable hydration errors as well as failed interactions. A READY build or empty error log is not a browser pass. Investigate unresolved hydration observations rather than hiding warnings or rerunning until a green result appears.
4. Validate authenticated OAuth, current member pricing/entitlement, cart-with-items and checkout in an explicitly authorized test setup. Never submit a real order, change a customer's membership or use customer credentials solely to satisfy a release checklist.
5. Review security/authorization boundaries, cookie/analytics consent and payment-widget changes relevant to the diff. Keep merchant secrets out of source, logs and artifacts.
6. Obtain release approval for the reviewed candidate and a rollback target. After deployment, verify the exact Production commit and repeat the agreed non-transactional smoke tests before calling the release successful.

Repository reachability cannot establish whether someone has configured an external cron/job outside this repository. Audit such external configuration separately when relevant; do not remove merchant-side resources based only on code-file usage.
