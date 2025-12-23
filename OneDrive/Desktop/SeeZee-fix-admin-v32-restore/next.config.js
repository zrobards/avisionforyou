/** @type {import('next').NextConfig} */
const nextConfig = {
  // Development source map configuration to prevent parsing errors
  productionBrowserSourceMaps: false,
  // Webpack/Turbopack configuration for TipTap/ProseMirror
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  // Turbopack configuration (Next.js 16+)
  // Empty config to silence the warning - webpack config handles fs fallback
  turbopack: {
    // Set root directory to silence multiple lockfiles warning
    root: __dirname,
  },
  images: {
    remotePatterns: [
      // Google OAuth profile images
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh4.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh5.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh6.googleusercontent.com',
      },
      // GitHub avatars (if using GitHub OAuth)
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      // Cloudinary (if using for image hosting)
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      // Gravatar (if using)
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
      },
      {
        protocol: 'https',
        hostname: 'gravatar.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // Compress responses
  compress: true,
  // Power by header removal for security
  poweredByHeader: false,
  // Trailing slash handling
  trailingSlash: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      // Redirect www to apex
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.see-zee.com' }],
        destination: 'https://see-zee.com/:path*',
        permanent: true,
      },
      // Removed admin dashboard redirect - now goes to main dashboard page
    ]
  },
}

module.exports = nextConfig