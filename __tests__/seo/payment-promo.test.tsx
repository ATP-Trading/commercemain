import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { TamaraWidget } from '@/components/product/tamara-widget';
import { TabbyPromo } from '@/components/product/tabby-promo';
afterEach(cleanup);
describe('payment promotions without valid configuration', () => {
  for (const [publicKey, price] of [['', '180'], ['   ', '180'], ['configured', '0'], ['configured', 'Infinity']]) {
    it(`does not load providers for key=${JSON.stringify(publicKey)} price=${price}`, () => {
      const { container } = render(<><TamaraWidget price={price} currencyCode="AED" locale="ar" publicKey={publicKey} countryCode="AE" /><TabbyPromo price={price} currencyCode="AED" locale="ar" publicKey={publicKey} merchantCode="default" /></>);
      expect(container.innerHTML).toBe('');
      expect(document.querySelector('script[src*="tamara.co"],script[src*="tabby.ai"]')).toBeNull();
    });
  }
});
