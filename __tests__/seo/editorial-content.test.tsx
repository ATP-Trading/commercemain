import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { existsSync, readFileSync } from 'node:fs';
import { CategoryData, IngredientData, BenefitData, LocationServices } from '@/lib/programmatic-seo/data';
import { ComparisonData } from '@/lib/programmatic-seo/comparison-data';
import { isEmsPromotion } from '@/lib/publication-policy';
import { EditorialSources } from '@/components/seo/editorial-sources';

describe('published editorial pages', () => {
  it('keeps related ingredient links and active category images resolvable', () => {
    for (const ingredient of Object.values(IngredientData)) {
      for (const related of ingredient.relatedIngredients) expect(IngredientData[related]).toBeDefined();
    }
    for (const category of Object.values(CategoryData).filter(c => !isEmsPromotion(c.slug))) {
      expect(existsSync(`public${category.image}`)).toBe(true);
    }
    for (const service of LocationServices.filter(s => !isEmsPromotion(s.slug))) {
      expect(['skincare', 'supplements', 'hair-care']).not.toContain(service.collection);
    }
  });
  it('gives every published ingredient, benefit and comparison a visible reference in both languages', () => {
    for (const slug of [...Object.keys(IngredientData), ...Object.keys(BenefitData), ...Object.keys(ComparisonData)].filter(s => !isEmsPromotion(s))) {
      for (const locale of ['ar', 'en']) {
        const html = renderToStaticMarkup(<EditorialSources slug={slug} locale={locale} />);
        expect(html).toContain('href="https://');
        expect(html).toContain(locale === 'ar' ? 'المراجع' : 'References');
      }
    }
  });
  it('does not restore obsolete shipping, returns or placeholder contact information in city pages', () => {
    const template = readFileSync('app/[locale]/[service]/[city]/page.tsx', 'utf8');
    expect(template).not.toMatch(/200 AED|200 درهم|14 days|14 يوم|XXXX|href="\/contact"/);
    expect(template).toContain('AED 250');
    expect(template).toContain('within 3 days');
  });
});
