import { NextRequest, NextResponse } from 'next/server';

// Read-only feed for the Instagram account configured on the server.
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
  const requestedLimit = Number(new URL(request.url).searchParams.get('limit') || 12);
  const limit = Number.isFinite(requestedLimit) ? Math.max(1, Math.min(25, Math.floor(requestedLimit))) : 12;
  const forceRefresh = new URL(request.url).searchParams.get('refresh') === 'true';
  const now = Date.now();
  const fallback = (details: Record<string, unknown>) => NextResponse.json({
    posts: cachedPosts?.slice(0, limit) || [],
    cached: Boolean(cachedPosts),
    stale: Boolean(cachedPosts),
    ...details,
  });
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken) return fallback({ error: 'Instagram connection is not configured' });
  if (!forceRefresh && cachedPosts && now - cacheTimestamp < CACHE_DURATION) {
    return NextResponse.json({ posts: cachedPosts.slice(0, limit), cached: true });
  }
  try {
    const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
    const apiUrl = new URL('https://graph.instagram.com/me/media');
    apiUrl.searchParams.set('fields', fields);
    apiUrl.searchParams.set('limit', '25');
    apiUrl.searchParams.set('access_token', accessToken);
    const response = await fetch(apiUrl.toString(), { cache: 'no-store', signal: AbortSignal.timeout(15000) });
    const data = await response.json();
    if (!response.ok || data.error) {
      // Numeric diagnostics only: never return provider messages, URLs or tokens.
      const diagnostics = {
        upstreamStatus: response.status,
        ...(typeof data.error?.code === 'number' ? { errorCode: data.error.code } : {}),
        ...(typeof data.error?.error_subcode === 'number' ? { errorSubcode: data.error.error_subcode } : {}),
      };
      console.warn('Instagram API request failed', diagnostics);
      return fallback({ error: 'Instagram connection failed', ...diagnostics });
    }
    if (!Array.isArray(data.data)) return fallback({ error: 'Instagram response was invalid' });
    cachedPosts = (data as InstagramApiResponse).data;
    cacheTimestamp = now;
    return NextResponse.json({ posts: cachedPosts.slice(0, limit), cached: false });
  } catch {
    // Exceptions may contain request URLs with credentials; do not serialize them.
    console.warn('Instagram request could not be completed');
    return fallback({ error: 'Instagram request could not be completed' });
  }
}
