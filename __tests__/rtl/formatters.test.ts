import { describe, expect, it } from 'vitest';
import { I18nFormatters, formatPrice, formatNumber, formatDate } from '@/lib/i18n/formatters';
import { UAE_DIRHAM_CODE } from '@/lib/constants';

describe('I18n Formatters RTL Tests', () => {
  describe('I18nFormatters class', () => {
    it('formats the English dirham amount without duplicating the component currency symbol', () => {
      const formatter = new I18nFormatters('en');
      // The rendering component owns the Dirham SVG; the formatter owns the amount.
      expect(formatter.formatPrice(100, UAE_DIRHAM_CODE)).toBe('100');
    });

    it('formats prices correctly in Arabic with Arabic numerals', () => {
      const formatter = new I18nFormatters('ar');
      expect(formatter.formatPrice(100, UAE_DIRHAM_CODE)).toBe('١٠٠');
    });

    it.each([[0, '0'], [99.5, '99.5'], [1234.56, '1,234.56'], [12.345, '12.35']] as const)(
      'preserves grouping and at most two decimals for %s dirhams', (amount, expected) => {
        expect(new I18nFormatters('en').formatPrice(amount, UAE_DIRHAM_CODE)).toBe(expected);
      }
    );

    it('retains standard currency formatting for a non-dirham amount', () => {
      const result = new I18nFormatters('en').formatPrice(100, 'USD');
      expect(result).toMatch(/\$/);
      expect(result).toContain('100');
    });

    it('formats numbers correctly in English', () => {
      expect(new I18nFormatters('en').formatNumber(1234)).toBe('1,234');
    });

    it('formats numbers correctly in Arabic', () => {
      expect(new I18nFormatters('ar').formatNumber(1234)).toMatch(/[٠-٩]/);
    });

    it('formats dates correctly', () => {
      const formatter = new I18nFormatters('en');
      expect(formatter.formatDate(new Date('2024-01-15T12:00:00Z'))).toBeTruthy();
    });
  });

  describe('Utility functions', () => {
    it('formatPrice utility returns numeric dirham amounts in both languages', () => {
      expect(formatPrice(100, 'en', UAE_DIRHAM_CODE)).toBe('100');
      expect(formatPrice(100, 'ar', UAE_DIRHAM_CODE)).toBe('١٠٠');
    });

    it('formatNumber utility works correctly', () => {
      expect(formatNumber(1234, 'en')).toBe('1,234');
      expect(formatNumber(1234, 'ar')).toMatch(/[٠-٩]/);
    });

    it('formatDate utility works correctly', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      expect(formatDate(date, 'en')).toBeTruthy();
      expect(formatDate(date, 'ar')).toBeTruthy();
    });
  });
});
