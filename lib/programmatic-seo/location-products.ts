import type { Product } from '@/lib/shopify/types';

// Match known product families, including localized titles; never fill a category
// with unrelated items merely because they share the broad Shopify collection.
const families: Record<string, RegExp> = {
  supplements: /mores|phytovy|sod.more|s\.o\.d|click.plus|nutrinal|orysamin|multivitamin|nutriga|كولاجين|فيتوفي|فيتامين/i,
  'skincare-products': /smone|s.mone|dna.hya|clear.plus|frozen.soap|glow.ii|vera.aloe|كريم|واقي.شمس|صابون|غسول.وجه|ألوفيرا/i,
  'hair-care': /hair.shampoo|شامبو|بلسم/i,
  'detox-products': /phytovy|فيتوفي/i,
  'collagen-supplements': /mores.collagen|brazilian.arabica|كولاجين/i,
  'water-technology': /alkamag|الكاماج|ألكاماج/i,
  'alkaline-water': /alkamag|الكاماج|ألكاماج/i,
  'soil-technology': /transform|ترانسفورم/i,
  'organic-farming': /transform|ترانسفورم/i,
};

export function filterLocationProducts(products: Product[], service: string): Product[] {
  const pattern = families[service];
  return pattern ? products.filter(product => pattern.test(`${product.handle} ${product.title}`)) : [];
}
