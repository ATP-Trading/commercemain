import { NextRequest, NextResponse } from 'next/server'
import { predictiveSearchQuery } from '@/lib/shopify/advanced-queries'
import { shopifyFetch } from '@/lib/shopify/server'
import type { Image, Money } from '@/lib/shopify/types'

interface PredictiveSearchOperation {
  data: {
    predictiveSearch: {
      products: {
        id: string;
        handle: string;
        title: string;
        vendor: string;
        featuredImage: Pick<Image, 'url' | 'altText'> | null;
        priceRange: { minVariantPrice: Money };
      }[];
      queries: { text: string; styledText: string }[];
      collections: {
        id: string;
        handle: string;
        title: string;
        image: Pick<Image, 'url' | 'altText'> | null;
      }[];
      pages: { id: string; handle: string; title: string }[];
    };
  };
  variables: {
    query: string;
    first: number;
    language: string;
    country: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { query, locale } = await request.json()
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // Parse locale for Shopify API
    const language = locale === 'ar' ? 'AR' : 'EN'
    const country = 'AE'

    // Fetch predictive search results from Shopify with locale context
    const response = await shopifyFetch<PredictiveSearchOperation>({
      query: predictiveSearchQuery,
      variables: {
        query: query.trim(),
        first: 10,
        language,
        country
      }
    })

    return NextResponse.json({
      success: true,
      results: response.body.data.predictiveSearch
    })

  } catch (error) {
    console.error('Predictive search error:', error)
    
    return NextResponse.json(
      { error: 'Failed to perform predictive search' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'