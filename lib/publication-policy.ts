import type { ShopifyMenuItem } from '@/lib/shopify/types';

export const isEmsPromotion = (value: string) => /(?:^|[^a-z])ems(?:[^a-z]|$)/i.test(value);
export const isInactiveCollection = (handle: string) => isEmsPromotion(handle) || ['home-services', 'yoga-pilates'].includes(handle);
export const unsupportedCities = new Set(['riyadh', 'jeddah', 'dammam', 'khobar', 'kuwait-city', 'manama', 'doha', 'muscat']);
export const isInactiveLocation = (service: string, city: string) => isEmsPromotion(service) || unsupportedCities.has(city);

export function filterPromotedMenu(items: ShopifyMenuItem[]): ShopifyMenuItem[] {
  return items.filter((item) => !isEmsPromotion(`${item.title} ${item.url || ''} ${item.resource && 'handle' in item.resource ? item.resource.handle : ''}`))
    .map((item) => ({ ...item, items: filterPromotedMenu(item.items || []) }));
}
