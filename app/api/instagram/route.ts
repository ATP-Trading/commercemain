import { NextRequest, NextResponse } from 'next/server';

/**
 * Instagram Graph API Route
 * 
 * Fetches recent posts from your Instagram Business/Creator account.
 * 
 * Setup Requirements:
 * 1. Create a Meta Developer App: https://developers.facebook.com/apps
 * 2. Add Instagram Graph API product
 * 3. Connect an Instagram Business or Creator account
 * 4. Generate a long-lived access token
 * 5. Set INSTAGRAM_ACCESS_TOKEN in your .env.local
 * 
 * The access token needs to be refreshed every 60 days.
 * Consider implementing a token refresh mechanism for production.
 */

export interface InstagramPost {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

interface InstagramApiResponse {
  data: InstagramPost[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

// Cache for Instagram posts (in-memory, resets on server restart)
let cachedPosts: InstagramPost[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 25);
    const forceRefresh = searchParams.get('refresh') === 'true';

    // Check cache
    const now = Date.now();
    if (!forceRefresh && cachedPosts && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json({
        posts: cachedPosts.slice(0, limit),
        cached: true,
        cacheAge: Math.round((now - cacheTimestamp) / 1000),
      });
    }

    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    
    if (!accessToken) {
      // Return demo data if no token is configured
      console.warn('INSTAGRAM_ACCESS_TOKEN not configured - returning demo data');
      return NextResponse.json({
        posts: getDemoInstagramPosts(limit),
        demo: true,
        message: 'Configure INSTAGRAM_ACCESS_TOKEN for real data',
      });
    }

    // Fetch from Instagram Graph API
    const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
    const apiUrl = `https://graph.instagram.com/me/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`;

    const response = await fetch(apiUrl, {
      next: { revalidate: 300 }, // Cache at edge for 5 minutes
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Instagram API error:', errorData);
      
      // Return cached data if available, even if stale
      if (cachedPosts) {
        return NextResponse.json({
          posts: cachedPosts.slice(0, limit),
          cached: true,
          stale: true,
          error: 'Using stale cache due to API error',
        });
      }

      // Fall back to demo data
      return NextResponse.json({
        posts: getDemoInstagramPosts(limit),
        demo: true,
        error: 'Instagram API error - using demo data',
      });
    }

    const data: InstagramApiResponse = await response.json();
    
    // Update cache
    cachedPosts = data.data;
    cacheTimestamp = now;

    return NextResponse.json({
      posts: data.data,
      cached: false,
    });

  } catch (error) {
    console.error('Instagram fetch error:', error);
    
    // Return demo data on error
    return NextResponse.json({
      posts: getDemoInstagramPosts(12),
      demo: true,
      error: 'Failed to fetch Instagram posts',
    });
  }
}

/**
 * Demo Instagram posts for development/preview
 * Using empty media_url to trigger CSS placeholder in component
 */
function getDemoInstagramPosts(_limit: number): InstagramPost[] {
  return [];
}
