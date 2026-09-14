const privateSections = ':section(account|auth|admin|cart|checkout|login|signup|private)';
const diagnosticSections = ':section(debug-[^/]+|test-[^/]+)';
const noindex = [{ key: 'X-Robots-Tag', value: 'noindex, follow' }];

// Config headers also cover dotted handles, which the locale proxy skips.
export const indexingHeaders = ['', '/:locale(en|ar)'].flatMap(prefix => [
  { source: `${prefix}/${privateSections}/:path*`, headers: noindex },
  { source: `${prefix}/${diagnosticSections}/:path*`, headers: noindex },
  { source: `${prefix}/membership/:action(signup|renew)/:path*`, headers: noindex },
  ...['q', 'sort'].map(key => ({ source: `${prefix}/search`, has: [{ type: 'query' as const, key }], headers: noindex })),
]);
