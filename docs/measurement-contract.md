# Storefront measurement contract — 2026-10-10

## Event ownership

- Public production storefront only: `www.atpgroupservices.ae`. Preview hosts do not send storefront analytics.
- GA4 `G-N47GG1EVK5`: manual `page_view`, `view_item`, successful `add_to_cart` / `remove_from_cart`, once-per-open `view_cart`, and `checkout_click` after a validated checkout URL is returned.
- `checkout_click` means a handoff attempt, not a loaded checkout or sale. Shopify checkout / its Google integration owns `begin_checkout`, payment events and `purchase`. No synthetic purchase or duplicate storefront purchase is emitted.
- Shopify: consented public `PAGE_VIEW` and successful `ADD_TO_CART`, with Shopify-provided visitor/session IDs and the real cart token (without its private `key`).
- The checkout URL is requested with Storefront `@inContext(visitorConsent: ...)` after session/buyer reconciliation. Only explicitly consented Shopify cookies are forwarded for that request, never application/customer authentication or Google cookies. Unknown consent stays null; marketing, preference and sale/sharing consent are not assumed.

## Privacy / attribution

Existing analytics, Google advertising, Shopify and Meta choices remain separate. A Google grant alone is not a Shopify grant. No analytics load or event precedes the applicable consent. Consent withdrawal clears the entry attribution retained in document memory.

Only sanitized campaign parameters are retained through consent delay and SPA navigation. Advertising click IDs require the existing separate Google Ads consent. Arbitrary query strings, account paths, payment tokens and search input are excluded. This is document-lifetime attribution, not a new persistent visitor database; reloads without campaign parameters cannot recover lost attribution.

## Staff and test visits

- Open `https://www.atpgroupservices.ae/en?atp_measurement=off` for staff browsing. The flag is tab-scoped and suppresses storefront GA4, Shopify and Meta measurement.
- `?atp_measurement=debug` sends consented GA4 events marked `debug_mode`, suppresses Shopify/Meta storefront events and passes declined checkout analytics consent. Do not create a real purchase solely to test analytics.
- `?atp_measurement=normal` restores ordinary consent-based measurement in that tab. Use a full-page navigation when changing modes.
- These flags do not erase past test data, affect other tabs, or identify staff automatically.

## Google configuration saved during this repair

- GA4 property 485425234: **ATP developer tests**, Developer Traffic, Exclude, **Active**, explicitly approved by the owner. Existing Internal Traffic filter remains Testing.
- Enhanced measurement: browser-history page changes disabled, because the application already sends manual SPA page views. Other enhanced measurement options unchanged.
- Google tag cross-domain exact matches: `atpgroupservices.ae`, `www.atpgroupservices.ae`, `checkout.atpgroupservices.ae`, `1jjfqc-hh.myshopify.com`.

## Validation and limits

- 78 targeted tests passed: consent/privacy, page deduplication and attribution, cart totals/events, checkout error/navigation behavior, Shopify proxy/session fields, buyer-session safety and discount display. TypeScript and diff whitespace checks passed.
- Official Shopify schema validator accepted the checkout consent query against Storefront 2026-01.
- Existing stock-server tests use removed static Admin-token fixtures and fail before stock assertions; those unrelated fixtures were not changed here.
- Google Ads clicks, consented sessions, users and purchases are different metrics. Ad blockers, consent rejection, abandoned page loads and processing delay can produce differences.
- Real payment/purchase delivery and transaction-ID deduplication must be reconciled against the next genuine Shopify paid order. No new payment was made or purchase invented for this repair. Historical refunds/test purchases are not corrected by these changes.
- QR/social visits without tagged links cannot be retroactively attributed. Use distinct `utm_source`, `utm_medium`, `utm_campaign` on future event, Instagram and Snapchat links.

## References

- [GA4 page views](https://developers.google.com/analytics/devguides/collection/ga4/views)
- [GA4 developer-traffic filters](https://support.google.com/analytics/answer/13296662)
- [Shopify contextual visitor consent](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/in-context)
- [Shopify headless consent and tracking](https://shopify.dev/docs/storefronts/headless/hydrogen/analytics/consent)
