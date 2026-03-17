/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');
const fs = require('fs');
const path = require('path');

// Import redirects if file exists
let blogRedirects = [];
try {
  const redirectsFile = path.join(process.cwd(), 'data', 'blog-redirects.json');
  if (fs.existsSync(redirectsFile)) {
    blogRedirects = JSON.parse(fs.readFileSync(redirectsFile, 'utf-8'));
  }
} catch (e) {
  // File doesn't exist yet, that's fine
}

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avisionforyourecovery.org' },
      { protocol: 'https', hostname: '*.avisionforyourecovery.org' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: '*.wixstatic.com' },
      { protocol: 'https', hostname: '*.squareusercdn.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  productionBrowserSourceMaps: false,
  compress: true,
  generateEtags: true,
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: '/donation',
        destination: '/donate',
        permanent: true,
      },
      // Wix blog URL patterns - general redirects
      {
        source: '/post/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
      {
        source: '/blog/post/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
      // Add specific redirects from migration
      ...blogRedirects.map(r => ({
        source: r.source,
        destination: r.destination,
        permanent: true,
      })),
    ];
  },
};

// Only wrap with Sentry if auth token is available
const sentryEnabled = !!process.env.SENTRY_AUTH_TOKEN;

module.exports = sentryEnabled
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: true,
      widenClientFileUpload: true,
      hideSourceMaps: true,
      sourcemaps: {
        deleteSourceMapsAfterUpload: true,
      },
      bundleSizeOptimizations: {
        excludeDebugStatements: true,
      },
    })
  : nextConfig;
