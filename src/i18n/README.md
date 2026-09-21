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

## Remaining legacy cleanup

The shared membership accessibility test fixture still imports Lingui directly and needs a separate migration. Its mixed accessibility tests have **not** been removed in this change.

`src/i18n/types.ts`, `src/i18n/lingui-types.d.ts`, `types/lingui.d.ts`, `global.d.ts`, `lingui.config.ts` and the old `src/locales` catalogs remain outside this removal boundary. Audit their remaining test, configuration and ambient consumers before deleting them.

In particular, `global.d.ts` also contains a Tamara custom-element declaration. It must not be deleted simply because its heading mentions Lingui. The independent `types/tamara-widget.d.ts` declaration and current payment widgets likewise require explicit preservation/review.
