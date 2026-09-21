# Storefront internationalization

The storefront uses **next-intl**. The former Lingui runtime wrappers have been retired after a complete pinned-source dependency audit. Do not import the removed `src/i18n/index.ts` barrel or recreate a global translation singleton.

## Current entry points

- `routing.ts` defines the supported `en` and `ar` locales and the English default.
- `request.ts` validates the request locale and loads the corresponding root `messages/en.json` or `messages/ar.json` catalog.
- `navigation.ts` exposes localized navigation through next-intl.
- `app/[locale]/layout.tsx` supplies messages to `NextIntlClientProvider` and configures the page direction.
- `components/language-switcher.tsx` handles language changes while preserving the current route, query parameters and hash.

Use `useLocale` and `useTranslations` from `next-intl` in client components. Use `getTranslations` and `setRequestLocale` from `next-intl/server` in server components. Import localized navigation from `@/src/i18n/navigation`.

Current storefront translation text lives in the root `messages` directory. Removing old helpers does not modify those catalogs, the current routing configuration, authentication, membership or checkout.

## Verification

`__tests__/i18n/current-request-config.test.ts` executes the current request-loader callback and real EN/AR catalogs, including fallback and concurrent request isolation.

`__tests__/i18n/current-provider.test.tsx` uses the real next-intl provider and hooks to check EN/AR catalog rendering, context updates, simultaneous independent locales and ICU interpolation/pluralization. It does not mock the translation engine.

Retirement checks guard against reintroducing imports of deleted runtime helpers. `__tests__/rtl/language-switcher.test.tsx` covers the current switcher variants and navigation state. The three dedicated Lingui runtime test files were retired together with their obsolete implementations; current translation tests replace their relevant runtime coverage, not their abandoned Lingui code-generation API.

These are isolated automated checks, not a full storefront browser, real OAuth session or checkout test.

## Retired compatibility artifacts

The unused Lingui configuration, declaration stubs, legacy type module and `src/locales` catalogs have been removed. Current translation content remains in the root `messages` directory. Do not reinstall an obsolete translation engine merely to satisfy a stale test.

The shared `TestProviders` fixture now supplies real `NextIntlClientProvider` and direction contexts without mounting any membership service or creating a network session. The membership accessibility suite exercises the retained `MembershipBadge` and `MemberPricing` with their current props, mocking only resolved membership state and framework routing. It includes axe scans in EN/AR and actual display-price calculations, not a real member authorization or checkout test.

The orphaned `AtpMembershipDashboard` and its dedicated scenarios were retired after checking all imports and deployment/test lists. This does not remove the current `app/[locale]/account/membership` page. Other historical membership services/hooks still require their own dependency audit; this is not their removal.

`global.d.ts` retains the existing Tamara custom-element declaration. `types/tamara-widget.d.ts`, active payment widgets, all current storefront text and routing remain unchanged. Retirement guards prevent importing removed modules or silently reintroducing fake Lingui module declarations.
