import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSelectedVariant } from '@/hooks/use-selected-variant';
import { ProductProvider } from '@/components/product/product-context';
import type { Product } from '@/lib/shopify/types';

const navigation = vi.hoisted(() => ({ searchParams: new URLSearchParams() }));
vi.mock('next/navigation', () => ({ useSearchParams: () => navigation.searchParams }));
beforeEach(() => { navigation.searchParams = new URLSearchParams(); });
const wrapper = ({ children }: { children: ReactNode }) => <ProductProvider>{children}</ProductProvider>;

// Mock product data
const mockProduct: Product = {
    id: 'test-product',
    handle: 'test-product',
    title: 'Test Product',
    description: 'Test description',
    descriptionHtml: '<p>Test description</p>',
    availableForSale: true,
    priceRange: {
        minVariantPrice: { amount: '10.00', currencyCode: 'AED' },
        maxVariantPrice: { amount: '20.00', currencyCode: 'AED' },
    },
    variants: [
        {
            id: 'variant-1',
            title: 'Small',
            availableForSale: true,
            selectedOptions: [{ name: 'Size', value: 'Small' }],
            price: { amount: '10.00', currencyCode: 'AED' },
        },
        {
            id: 'variant-2',
            title: 'Large',
            availableForSale: true,
            selectedOptions: [{ name: 'Size', value: 'Large' }],
            price: { amount: '20.00', currencyCode: 'AED' },
        },
    ],
    options: [
        {
            id: 'option-1',
            name: 'Size',
            values: ['Small', 'Large'],
        },
    ],
    images: [],
    tags: [],
    seo: { title: '', description: '' },
    createdAt: '',
    updatedAt: '',
};

describe('useSelectedVariant with the real product context', () => {
  it('returns the first available variant with no selection', () => {
    const { result } = renderHook(() => useSelectedVariant(mockProduct), { wrapper });
    expect(result.current.selectedVariant?.id).toBe('variant-1');
    expect(result.current.price.amount).toBe('10.00');
  });
  it('uses Next search parameters to select the requested variant and price', () => {
    navigation.searchParams = new URLSearchParams('size=Large');
    const { result } = renderHook(() => useSelectedVariant(mockProduct), { wrapper });
    expect(result.current.selectedVariant?.id).toBe('variant-2');
    expect(result.current.price.amount).toBe('20.00');
    expect(result.current.availableForSale).toBe(true);
  });
  it('handles a single-variant product', () => {
    const product = { ...mockProduct, variants: [mockProduct.variants[0]!], options: [] };
    const { result } = renderHook(() => useSelectedVariant(product), { wrapper });
    expect(result.current.selectedVariant?.id).toBe('variant-1');
    expect(result.current.price.amount).toBe('10.00');
  });
  it('reacts to real search-parameter content changes on rerender', () => {
    const { result, rerender } = renderHook(() => useSelectedVariant(mockProduct), { wrapper });
    navigation.searchParams = new URLSearchParams('size=Large');
    rerender();
    expect(result.current.selectedVariantId).toBe('variant-2');
    navigation.searchParams = new URLSearchParams('size=Small');
    rerender();
    expect(result.current.selectedVariantId).toBe('variant-1');
  });
  it('falls back to an available variant for an unmatched option', () => {
    navigation.searchParams = new URLSearchParams('size=Unknown');
    const product = { ...mockProduct, variants: mockProduct.variants.map((v, i) => ({ ...v, availableForSale: i === 1 })) };
    const { result } = renderHook(() => useSelectedVariant(product), { wrapper });
    expect(result.current.selectedVariantId).toBe('variant-2');
    expect(result.current.availableForSale).toBe(true);
  });
  it('keeps an explicitly selected sold-out variant unavailable instead of substituting another', () => {
    navigation.searchParams = new URLSearchParams('size=Large');
    const product = { ...mockProduct, variants: mockProduct.variants.map((v, i) => ({ ...v, availableForSale: i === 0 })) };
    const { result } = renderHook(() => useSelectedVariant(product), { wrapper });
    expect(result.current.selectedVariantId).toBe('variant-2');
    expect(result.current.availableForSale).toBe(false);
    expect(result.current.price.amount).toBe('20.00');
  });
  it('reports unavailable when all variants are sold out', () => {
    const product = { ...mockProduct, availableForSale: false, variants: mockProduct.variants.map(v => ({ ...v, availableForSale: false })) };
    const { result } = renderHook(() => useSelectedVariant(product), { wrapper });
    expect(result.current.selectedVariantId).toBe('variant-1');
    expect(result.current.availableForSale).toBe(false);
  });
  it('uses the product price range when the product has no variants', () => {
    const { result } = renderHook(() => useSelectedVariant({ ...mockProduct, variants: [], availableForSale: false }), { wrapper });
    expect(result.current.selectedVariant).toBeUndefined();
    expect(result.current.price).toEqual(mockProduct.priceRange.minVariantPrice);
    expect(result.current.availableForSale).toBe(false);
  });
});
