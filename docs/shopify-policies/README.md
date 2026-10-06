# Bilingual policy drafts — 6 October 2026

These HTML files are prepared content, NOT deployed policies. The live storefront
and Shopify checkout continue to read Shopify policies. Do not silently replace
the storefront policy source with these files: checkout must remain consistent.

Publishing through the connected Shopify app was blocked by missing
`write_legal_policies` scope. No policy write succeeded.

## Prepared

- Privacy: complete Arabic and English text, both domains, actual Google/Shopify
  analytics and Google/Meta consent choices, contact details, data rights and no
  Liquid placeholders.
- Terms: complete Arabic and English text, working policy links, verified public
  contacts, current published membership rates and product delivery exceptions.

## Confirm before completing legal identity and operational terms

- Current legal seller, renewed licence, registration number, physical business
  address and VAT status. Available ATP Trading licence copy expires 2026-03-20;
  existing Shopify policies contain conflicting addresses and registration data.
  Do not infer a current licence status or publish a guessed address/number.
- How approved cash-on-delivery refunds are paid and the inspection/review SLA.
- Whether cancelling renewal preserves benefits until the paid expiry date;
  the legacy cancellation service contains an unimplemented persistence TODO.
  Do not promise expiry-date access without checking the active subscription app.
- Shopify's checkout subscription policy is not returned in `shop.shopPolicies`;
  the live checkout shows a generic subscription/preorder template. Replace it
  with membership-specific bilingual terms through the supported admin setting
  after the cancellation behavior is confirmed.

## Publishing procedure

1. Confirm the points above and update these drafts where needed.
2. Back up each current policy and its Arabic translation.
3. Update the English policy using `shopPolicyUpdate`.
4. Read its fresh `translatableResource.translatableContent` digest.
5. Register the corresponding Arabic HTML with `translationsRegister`, key `body`.
6. Verify both languages on the storefront AND checkout; confirm no raw Liquid,
   `[INSERT ...]` or `[LINK ...]` remains.

## Product facts still requiring source confirmation

Pack sizes/counts identified in the audit must be checked against the current
product label, not gross shipping weights from supplier invoices. DNA HYA's
available brochure text does not specify a pack size. Transform Soil's source
PDF repeats 1.5–2 Rai for both perennial-tree dilutions, so the website's area
must not be mathematically corrected without manufacturer clarification.
The 36-versus-37 Veggie Jelly ingredient count and quantitative claims need the
current manufacturer evidence before content changes.
