/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
      domains: [
        'images.unsplash.com',
        'localhost',
        'claude-app-dev-platform-artifacts.s3.amazonaws.com'
      ]
    },
    // Enable SWR for edge functions if needed in the future
    experimental: {
      serverActions: true,
    },
    // Environment variables that should be available to the browser
    env: {
      NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version,
    },
    // Headers for security
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block',
            },
          ],
        },
      ];
    },
    // Redirects for common paths
    async redirects() {
      return [
        {
          source: '/home',
          destination: '/',
          permanent: true,
        },
      ];
    },
  };
  
  module.exports = nextConfig;