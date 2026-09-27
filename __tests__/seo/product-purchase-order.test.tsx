import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ATPProductDescription } from '@/components/product/atp-product-description';
import type { Product } from '@/lib/shopify/types';

const state = vi.hoisted(() => ({ member: false }));
vi.mock('next/image', () => ({ default: (props: any) => <img {...props} /> }));
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key, useLocale: () => 'en' }));
vi.mock('@/hooks/use-rtl', () => ({ useRTL: () => ({ isRTL: false }) }));
vi.mock('@/hooks/use-storefront-membership-pricing', () => ({ useMembershipDiscount: () => ({ hasActiveMembership: state.member, calculateServiceDiscount: (price: number) => ({ finalPrice: price * .85 }) }) }));
vi.mock('@/hooks/use-selected-variant', () => ({ useSelectedVariant: (p: Product) => ({ price: p.variants[0]!.price, selectedVariant: p.variants[0], selectedVariantId: p.variants[0]!.id }) }));
vi.mock('@/lib/hooks/use-inventory-quantity', () => ({ useInventoryQuantity: () => ({ quantity: 20, isLoading: false }) }));
vi.mock('@/lib/shopify/member-product-eligibility', () => ({ isMemberDiscountEligible: () => true, getMemberDiscountRate: () => .15 }));
vi.mock('@/lib/shopify/i18n-queries', () => ({ getLocalizedProductTitle: (p: Product) => p.title, getLocalizedProductDescriptionHtml: (p: Product) => p.descriptionHtml }));
vi.mock('@/components/price', () => ({ default: ({ amount }: { amount: string }) => <span>{amount}</span> }));
vi.mock('@/components/product/quantity-selector', async () => {
  const React = await import('react');
  const Context = React.createContext<any>(null);
  return {
    QuantityProvider: ({ children }: any) => { const [quantity, setQuantity] = React.useState(1); return <Context.Provider value={{quantity, setQuantity}}>{children}</Context.Provider>; },
    useQuantity: () => React.useContext(Context),
    QuantitySelector: () => { const {quantity, setQuantity} = React.useContext(Context); return <input aria-label="Quantity" type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />; },
  };
});
vi.mock('@/components/product/product-description-accordion', () => ({ ProductDescriptionAccordion: () => <section aria-label="Product information">Overview, What's Included, Key Benefits, Ingredients, How to Use, Disclaimer</section> }));
vi.mock('@/components/cart/atp-add-to-cart', () => ({ ATPAddToCart: () => <button>Add to Cart</button> }));
vi.mock('@/components/product/sticky-add-to-cart', () => ({ StickyAddToCart: () => null }));
vi.mock('@/components/product/variant-selector', () => ({ VariantSelector: () => null }));
vi.mock('@/components/product/urgency-signals', () => ({ UrgencySignals: () => null }));
vi.mock('@/components/product/tabby-promo', () => ({ TabbyPromo: () => null }));
vi.mock('@/components/product/tamara-widget', () => ({ TamaraWidget: () => null }));
vi.mock('@/components/reviews/product-reviews', () => ({ ProductReviews: () => null }));
const product = { id: 'p1', title: 'Test Product', handle: 'test-product', tags: [], options: [], descriptionHtml: '<p>Product details</p>', variants: [{ id: 'v1', availableForSale: true, price: { amount: '180.00', currencyCode: 'AED' } }] } as unknown as Product;
afterEach(() => { cleanup(); state.member = false; });
describe('product purchase order and quantity pricing', () => {
  it('puts information before quantity and updates total and both installments', () => {
    render(<ATPProductDescription product={product} locale="en" />);
    expect(screen.getByRole('region', {name: 'Product information'}).compareDocumentPosition(screen.getByLabelText('Quantity')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const payments = screen.getByRole('complementary', {name: 'Flexible payment options'});
    expect(within(payments).getAllByText('45.00 AED')).toHaveLength(2);
    fireEvent.change(screen.getByLabelText('Quantity'), {target: {value: '2'}});
    expect(screen.getByText('360.00')).toBeTruthy();
    expect(within(payments).getAllByText('90.00 AED')).toHaveLength(2);
    fireEvent.change(screen.getByLabelText('Quantity'), {target: {value: '1'}});
    expect(within(payments).getAllByText('45.00 AED')).toHaveLength(2);
    expect(screen.queryByText('Secure Payment')).toBeNull();
    expect(screen.getByText('Free shipping on orders from AED 250.')).toBeTruthy();
  });
  it('preserves active member pricing without a membership promotion', () => {
    state.member = true;
    render(<ATPProductDescription product={product} locale="en" />);
    fireEvent.change(screen.getByLabelText('Quantity'), {target: {value: '2'}});
    expect(screen.getByText('306.00')).toBeTruthy();
    expect(screen.getAllByText('76.50 AED')).toHaveLength(2);
    expect(screen.queryByText('Join Membership')).toBeNull();
  });
});
