import type { Product } from "@/lib/shopify/types";
import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/shopify/server';
import { defaultSort, sorting } from '@/lib/constants';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const sort = searchParams.get('sort') || '';
        const category = searchParams.get('category') || '';
        const minPrice = searchParams.get('min_price');
        const maxPrice = searchParams.get('max_price');
        const brand = searchParams.get('brand') || '';
        const availability = searchParams.get('availability') || '';
        const rating = searchParams.get('rating') || '';

        // Get sort configuration
        const { sortKey, reverse } = sorting.find((item) => item.slug === sort) || defaultSort;

        // Build search query with filters
        let searchQuery = query;

        // Add category filter
        if (category) {
            const categories = category.split(',');
            searchQuery += ` ${categories.map(cat => `tag:${cat}`).join(' OR ')}`;
        }

        // Add brand filter
        if (brand) {
            const brands = brand.split(',');
            searchQuery += ` ${brands.map(b => `vendor:${b}`).join(' OR ')}`;
        }

        // Add availability filters
        if (availability) {
            const availabilityFilters = availability.split(',');
            availabilityFilters.forEach(filter => {
                switch (filter) {
                    case 'in-stock':
                        searchQuery += ' available:true';
                        break;
                    case 'on-sale':
                        searchQuery += ' tag:sale';
                        break;
                    case 'new-arrivals':
                        searchQuery += ' tag:new';
                        break;
                    case 'member-exclusive':
                        searchQuery += ' tag:member-exclusive';
                        break;
                }
            });
        }

        // Fetch products with filters
        const products = await getProducts({
            sortKey,
            reverse,
            query: searchQuery.trim(),
            locale: {
                language: 'en', // Default to English, can be enhanced with locale detection
                country: 'AE',
            },
        });

        // Apply client-side price filtering if needed
        let filteredProducts = products;
        if (minPrice || maxPrice) {
            const min = minPrice ? parseFloat(minPrice) : 0;
            const max = maxPrice ? parseFloat(maxPrice) : Infinity;

            filteredProducts = products.filter(product => {
                const price = parseFloat(product.priceRange.minVariantPrice.amount);
                return price >= min && price <= max;
            });
        }

        // Apply rating filter (mock implementation)
        if (rating && rating !== 'any') {
            const minRating = parseFloat(rating.replace('+', ''));
            // This would typically come from a reviews database
            // For now, we'll use a mock rating based on product handle
            filteredProducts = filteredProducts.filter(product => {
                const mockRating = (product.handle.length % 5) + 1;
                return mockRating >= minRating;
            });
        }

        // Generate search suggestions based on query
        const suggestions = generateSearchSuggestions(query, filteredProducts);

        return NextResponse.json({
            products: filteredProducts,
            suggestions,
            totalCount: filteredProducts.length,
            appliedFilters: {
                query,
                sort,
                category,
                brand,
                availability,
                rating,
                priceRange: minPrice || maxPrice ? { min: minPrice, max: maxPrice } : null,
            },
        });

    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch search results' },
            { status: 500 }
        );
    }
}

function generateSearchSuggestions(query: string, products: Pick<Product, "title" | "description">[]): string[] {
    if (!query || query.length < 2) return [];

    const suggestions = new Set<string>();

    // Extract keywords from product titles and descriptions
    products.forEach(product => {
        const title = product.title.toLowerCase();
        const description = product.description?.toLowerCase() || '';

        // Add related terms based on the query
        if (title.includes(query.toLowerCase())) {
            const words = title.split(' ');
            words.forEach((word: string, index: number) => {
                if (word.length > 3 && word !== query.toLowerCase()) {
                    if (index < words.length - 1) {
                        suggestions.add(`${query} ${words[index + 1]}`);
                    }
                    suggestions.add(`${word} ${query}`);
                }
            });
        }
    });

    // Add category-based suggestions
    const categoryKeywords = {
        'skincare': ['serum', 'cream', 'cleanser', 'moisturizer', 'toner'],
        'supplements': ['vitamin', 'mineral', 'protein', 'omega', 'collagen'],
        'ems': ['equipment', 'training', 'device', 'stimulator', 'therapy'],
        'water': ['purification', 'filter', 'treatment', 'quality', 'system'],
        'soil': ['analysis', 'testing', 'improvement', 'nutrients', 'ph']
    };

    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
        if (query.toLowerCase().includes(category) || keywords.some(k => query.toLowerCase().includes(k))) {
            keywords.forEach(keyword => {
                if (keyword !== query.toLowerCase()) {
                    suggestions.add(`${query} ${keyword}`);
                }
            });
        }
    });

    return Array.from(suggestions).slice(0, 8);
}

// Export for static generation
export const dynamic = 'force-dynamic';
