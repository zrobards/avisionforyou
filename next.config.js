/** @type {import('next').NextConfig} */
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
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
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

module.exports = nextConfig;
