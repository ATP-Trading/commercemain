// Run before locale handling so legacy Shopify links return real HTTP redirects.
export const legacyRedirects = ['', '/:locale(en|ar)'].flatMap(prefix => {
  const destination = prefix || '/en';
  return [
    { source: `${prefix}/collections/:collection/products/:handle`, destination: `${destination}/product/:handle`, permanent: true },
    { source: `${prefix}/products/:handle`, destination: `${destination}/product/:handle`, permanent: true },
    { source: `${prefix}/collections/all`, destination: `${destination}/search`, permanent: true },
  ];
});
