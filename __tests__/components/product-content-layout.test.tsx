import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { parseDescriptionHtml, ProductDescriptionAccordion } from '@/components/product/product-description-accordion';

const en = '<h2>Overview</h2><p><strong>Pack contents:</strong> 10 sachets × 15 g (150 g total).</p><p>A cocoa drink for everyday use.</p><h2>Ingredients</h2><p>Cocoa powder.</p><h2>How to use</h2><p>Mix with water.</p><h2>Disclaimer</h2><p>Contains milk-derived ingredients.</p><p>Use as part of a balanced diet.</p>';
const ar = '<h2>نظرة عامة</h2><p><strong>محتويات العبوة:</strong> 10 أظرف × 15 غرامًا (الإجمالي 150 غرامًا).</p><p>مشروب كاكاو للاستخدام اليومي.</p><h2>المكونات</h2><p>مسحوق الكاكاو.</p><h2>طريقة الاستخدام</h2><p>يخلط مع الماء.</p><h2>تنبيه</h2><p>يحتوي على <strong>مكونات مشتقة من الحليب</strong>.</p><p>استشر مختصاً صحياً قبل الاستخدام.</p>';

describe('product description layout', () => {
  it.each([[en, false], [ar, true]] as const)('preserves every body fact and separates pack contents from overview', (html, rtl) => {
    const sections = parseDescriptionHtml(html, rtl);
    expect(sections.map(s => s.title)).toEqual(['overview', 'contents', 'ingredients', 'usage', 'disclaimer']);
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const output = new DOMParser().parseFromString(sections.map(s => s.content).join(''), 'text/html').body.textContent!;
    for (const p of doc.querySelectorAll('p')) expect(output).toContain(p.textContent);
    expect(sections.find(s => s.title === 'contents')!.content).not.toContain(rtl ? 'مشروب كاكاو' : 'A cocoa drink');
    expect(sections.find(s => s.title === 'disclaimer')!.content).toContain(rtl ? 'الحليب' : 'milk');
  });
  it('retains small soap weights and does not consume the following description', () => {
    const sections = parseDescriptionHtml('<h2>Deep Clean. Instant Cool.</h2><p><strong>Pack contents:</strong> 95 g.</p><p>Refreshing body soap.</p><h2>Warnings</h2><p>For external use only.</p>', false);
    expect(sections.find(s => s.title === 'contents')!.content).toContain('95 g');
    expect(sections.find(s => s.title === 'overview')!.content).toContain('Refreshing body soap.');
  });
  it('keeps unknown content, short intros and legacy exact headings', () => {
    const sections = parseDescriptionHtml('<p>Soap.</p><p><strong>Ingredients</strong></p><p>Contains cocoa.</p><h2>Additional information</h2><p>Keep this information.</p>', false);
    expect(sections[0].content).toContain('Soap.');
    expect(sections.map(s => s.content).join('')).toContain('Keep this information.');
    expect(sections.find(s => s.title === 'ingredients')!.content).toContain('Contains cocoa.');
  });
  it('keeps the original accordion layout and purchasing controls below every section', () => {
    render(<><ProductDescriptionAccordion descriptionHtml={en} /><button>Purchase product</button></>);
    const overview = screen.getByRole('button', {name: 'Overview'});
    const pack = screen.getByRole('button', {name: "What's Included"});
    const ingredients = screen.getByRole('button', {name: 'Ingredients'});
    const disclaimer = screen.getByRole('button', {name: 'Disclaimer'});
    const purchase = screen.getByRole('button', {name: 'Purchase product'});
    expect(overview).toHaveAttribute('aria-expanded', 'true');
    expect(pack).toHaveAttribute('aria-expanded', 'false');
    expect(pack.compareDocumentPosition(ingredients) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(disclaimer.compareDocumentPosition(purchase) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    fireEvent.click(pack);
    expect(screen.getByText(/10 sachets/)).toBeVisible();
    fireEvent.click(disclaimer);
    expect(screen.getByText(/Contains milk/)).toBeVisible();
  });
});

import fixtures from './fixtures/product-descriptions';

const parsed = (id: string, locale: 'en' | 'ar') => parseDescriptionHtml(fixtures.find(f => f.id === id)![locale], locale === 'ar');
const section = (id: string, locale: 'en' | 'ar', type: string) => parsed(id, locale).find(s => s.title === type)?.content || '';

describe('live catalog description regressions', () => {
  for (const fixture of fixtures) for (const locale of ['en', 'ar'] as const) {
    it(`preserves body facts for ${fixture.id} ${locale}`, () => {
      const source = new DOMParser().parseFromString(fixture[locale], 'text/html');
      const sections = parsed(fixture.id, locale);
      const output = new DOMParser().parseFromString(sections.map(s => s.content).join(''), 'text/html');
      const normalize = (s: string) => s.replace(/\s+/g, ' ').trim();
      const text = normalize(output.body.textContent || '');
      for (const el of source.querySelectorAll('p, li, td')) {
        const fact = normalize(el.textContent || '');
        // Short, standalone labels may become accordion titles; body facts must remain.
        if (fact.length > 65 || el.matches('li, td') || /\d/.test(fact)) expect(text).toContain(fact);
      }
      expect(sections.every(s => s.content.trim())).toBe(true);
    });
  }
  it.each(['en', 'ar'] as const)('separates ingredients, details, warnings and operational sections in %s', locale => {
    expect(section('8906627154158', locale, 'ingredients')).toContain(locale === 'en' ? 'Mushroom' : 'الفطر');
    expect(section('8906627154158', locale, 'product-details')).toContain('250');
    expect(section('8958618370286', locale, 'product-details')).toContain('30');
    expect(section('8757287583982', locale, 'product-details')).toContain('300');
    for (const id of ['8900200628462', '8904560836846']) {
      expect(section(id, locale, 'filter-components')).toContain('KDF');
      expect(section(id, locale, 'delivery')).toContain('10');
      expect(section(id, locale, 'usage')).not.toContain(locale === 'en' ? 'date of order' : 'تاريخ الطلب');
    }
    expect(section('8900200628462', locale, 'warranty')).toBeTruthy();
    expect(section('8901190418670', locale, 'lab-results')).toBeTruthy();
    expect(section('8901190418670', locale, 'contents')).toContain('1');
    for (const number of [1, 2, 3, 4]) expect(section('8901190418670', locale, 'usage')).toContain(locale === 'en' ? `Method ${number}` : `الطريقة ${number}`);
    for (const id of ['8757286961390', '8801824309486', '8906884874478', '9130449305838']) {
      expect(section(id, locale, 'contents')).toBeTruthy();
      expect(section(id, locale, 'usage')).toBeTruthy();
    }
    expect(section('9130449305838', locale, 'audience')).toBeTruthy();
    expect(section('9130449305838', locale, 'disclaimer')).toBeTruthy();
    expect(parsed('9130449305838', locale).map(s => s.content).join('')).not.toContain('<details');
  });
  it('recognizes Arabic legacy labels and removes decorative separators', () => {
    expect(section('8757288206574', 'ar', 'warnings')).toBeTruthy();
    expect(section('9155861643502', 'ar', 'ingredients')).toContain('Q10');
    expect(section('9155861643502', 'ar', 'benefits')).not.toContain('Q10');
    expect(parsed('9155861643502', 'ar').map(s => s.content).join('')).not.toContain('⸻');
  });
});
