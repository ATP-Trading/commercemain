import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { filterPromotedMenu, isEmsPromotion, isInactiveLocation } from '@/lib/publication-policy';
import { StructuredData } from '@/components/structured-data';
import { inactiveServiceMetadata } from '@/components/inactive-service-page';
import { UAECities, LocationServices } from '@/lib/programmatic-seo/data';
import type { ShopifyMenuItem } from '@/lib/shopify/types';

describe('approved publication scope', () => {
  it('removes nested EMS promotions without dropping the rest of the menu', () => {
    const menu = [{ id: 'parent', title: 'Products', url: '/search', items: [
      { id: 'ems', title: 'تدريب EMS', url: '/ar/ems', items: [] },
      { id: 'skin', title: 'Skincare', url: '/collections/skincare', items: [] },
    ] }] as ShopifyMenuItem[];
    expect(filterPromotedMenu(menu)[0].items.map(item => item.id)).toEqual(['skin']);
    expect(menu[0].items).toHaveLength(2);
  });
  it('does not confuse ordinary words with EMS', () => {
    expect(isEmsPromotion('water systems')).toBe(false);
    expect(isEmsPromotion('ems-pro-one-suit')).toBe(true);
    expect(isEmsPromotion('/category/ems-training')).toBe(true);
  });
  it('limits location campaigns to 108 non-EMS UAE combinations per language', () => {
    const active = LocationServices.flatMap(service => UAECities.filter(city => !isInactiveLocation(service.slug, city.slug)).map(city => ({ service, city })));
    expect(active).toHaveLength(108);
    expect(active.every(({ city, service }) => city.country === 'AE' && !isEmsPromotion(service.slug))).toBe(true);
  });
  it('keeps an old URL canonical while removing its indexing eligibility', () => {
    const metadata = inactiveServiceMetadata('ar', '/ems');
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.alternates?.canonical).toBe('/ar/ems');
    expect(metadata.description).not.toMatch(/training/i);
  });
  it('publishes the approved brand without fabricated company facts', () => {
    const html = renderToStaticMarkup(<StructuredData type="Organization" data={{}} />);
    const schema = JSON.parse(html.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, ''));
    expect(schema.name).toBe('ATP Trading');
    expect(schema.contactPoint.areaServed).toEqual(['AE']);
    for (const key of ['foundingDate', 'legalName', 'address', 'aggregateRating', 'openingHoursSpecification', 'telephone']) expect(schema).not.toHaveProperty(key);
    expect(html).not.toMatch(/EMS|XXX|Business Bay|1250|2010/);
  });
});
