import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
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
  it('shows pack contents before purchase and detail controls after purchase', () => {
    render(<ProductDescriptionAccordion descriptionHtml={en}><button>Purchase product</button></ProductDescriptionAccordion>);
    const pack = screen.getByRole('region', {name: "What's Included"});
    const purchase = screen.getByRole('button', {name: 'Purchase product'});
    const ingredients = screen.getByRole('button', {name: 'Ingredients'});
    expect(pack.compareDocumentPosition(purchase) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(purchase.compareDocumentPosition(ingredients) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText(/10 sachets/)).toBeVisible();
    expect(ingredients).toHaveAttribute('aria-expanded', 'false');
  });
});
