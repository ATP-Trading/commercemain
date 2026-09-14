import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';
import { indexingHeaders } from './lib/indexing-headers';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl({

  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    inlineCss: true,
    useCache: true,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      'framer-motion',
      'recharts',
      'date-fns',
      'react-icons',
    ],
    webpackMemoryOptimizations: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/s/files/**",
      },
      {
        // Instagram CDN for Graph API images
        protocol: "https",
        hostname: "*.cdninstagram.com",
      },
      {
        // Instagram CDN alternate domain
        protocol: "https",
        hostname: "scontent.cdninstagram.com",
      },
      {
        // Instagram CDN with region codes (e.g., scontent-iad3-1.cdninstagram.com)
        protocol: "https",
        hostname: "scontent-*.cdninstagram.com",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  compress: true,
  poweredByHeader: false,
  typescript: {
    // TypeScript errors are now fixed - strict checking enabled
    ignoreBuildErrors: false,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Simplified webpack configuration to avoid vendor chunks issues
    if (!isServer) {
      // Only apply client-side optimizations
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            default: {
              minChunks: 1,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    // Ensure proper module resolution
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      },
    };

    return config;
  },
  async headers() {
    return [
      ...indexingHeaders,
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/fonts/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ]
  },
});
