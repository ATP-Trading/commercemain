# Verification commands and limits

Use the repository's pinned pnpm version and frozen lockfile. Never provide merchant secrets to isolated tests.

- `pnpm test:run` runs default Vitest discovery without a selected-folder allowlist. Only Playwright-owned `__tests__/e2e` files are separated from the default Vitest exclusions. Missing/empty suites still fail.
- `pnpm test:unit` runs non-TSX tests; `pnpm test:components` runs current TSX tests wherever located; `pnpm test:accessibility` runs the current accessibility folder. These groups overlap with default discovery and must not be added to its total.
- `pnpm test:membership` selects current membership-related tests. `pnpm test:webhooks` checks stopped webhook/cron route contracts, NOT external Shopify webhook delivery.
- `pnpm lint` runs ESLint directly with the same Next core-web-vitals and TypeScript presets formerly declared in `.eslintrc.json`. The existing locked ESLint dependency provides FlatCompat. No application directories or rules are suppressed. Existing rule violations remain failures.
- `pnpm typecheck` runs TypeScript independently of the build.
- `pnpm test:all` (also `test:ci`) runs lint, TypeScript and all default Vitest tests once, without a shell or hidden network audit. Every requested check is reported, and any failure, timeout or startup error returns a nonzero exit code. This command is not a storefront release certificate.
- `pnpm test:coverage` and `test:reports` produce Vitest coverage. No invented performance, security or accessibility certification is printed.
- `pnpm test:e2e --list` discovers Playwright cases without executing them. An explicitly authorized deployment origin in `TEST_BASE_URL` is required to execute `test:e2e` or `test:release` (the latter adds browser smoke to the static checks). Install the requested browser engines beforehand. No local server is started automatically.

## Browser coverage is intentionally limited

The current Playwright suite checks EN/AR guest login/signup and the membership alias using actual server-rendered pages with JavaScript disabled. This prevents client-side cart initialization; no account data, membership, product, payment or localStorage fixture is written. It does NOT test hydration, client-menu interaction, genuine OAuth completion, logged-in entitlement, member discounts, carts with items or checkout. Those require a separately authorized interactive plan. A successful listing is not a browser pass.

The old five-case signup/localStorage Playwright suite is archived verbatim as `docs/legacy-membership/membership-signup-flow.test.ts.txt`; it targeted the retired engine and is not executable coverage. Its fake setup and misleading teardown summary were removed. Five completely empty test files and two arithmetic-only placeholders were removed rather than counted as Shopify tests. Real existing assertions are preserved, with the variant fixture now supplying Next navigation context instead of rewriting window.location.

## Publication gates remain explicit

PR36's raw Arabic hydration observation is not fixed by test-tool changes. All remaining ESLint errors and the final combined deployment's interactive checks must be resolved or reliably attributed before release. Do not confuse build success or isolated tests with those missing checks.
