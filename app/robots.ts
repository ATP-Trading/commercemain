import type { MetadataRoute } from 'next';
import { baseUrl } from '@/lib/utils';

export default function robots(): MetadataRoute.Robots {
  return {
    // Account/debug pages must be crawlable for their noindex headers to be read.
    // Keep rendering assets accessible and use the same rules for Googlebot.
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/trpc/'] },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
