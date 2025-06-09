import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript and ESLint settings
  typescript: {
    // Dangerously allow production builds to successfully complete even if your project has type errors
    ignoreBuildErrors: false,
  },
  eslint: {
    // Disable ESLint during builds (handled separately in CI/CD)
    ignoreDuringBuilds: false,
  },

  // Image optimization
  images: {
    // Enable modern image formats
    formats: ['image/webp', 'image/avif'],
    // Configure domains for external images (Supabase Storage, etc.)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Enable optimized loader for better performance
    loader: 'default',
  },

  // Performance optimizations
  experimental: {
    // Enable optimizePackageImports for better bundle size
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      'recharts',
      'date-fns',
    ],
  },

  // Turbopack configuration (moved from experimental)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Webpack configuration for additional optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Exclude test files from build
    config.module.rules.push({
      test: /\.(test|spec)\.(ts|tsx|js|jsx)$/,
      loader: 'ignore-loader',
    });

    // Exclude test directories from build
    config.module.rules.push({
      test: /[\\/](__tests__|__mocks__)[\\/]/,
      loader: 'ignore-loader',
    });

    // Optimize bundle size by analyzing what's included
    if (!dev && !isServer) {
      // Add bundle analyzer in development if needed
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: './analyze/client.html',
            openAnalyzer: false,
          })
        );
      }
    }

    // Optimize imports and tree-shaking
    config.resolve.alias = {
      ...config.resolve.alias,
      // Ensure proper tree-shaking for lodash and similar libraries
      'lodash': 'lodash-es',
    };

    return config;
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },

  // Redirects for common routes
  async redirects() {
    return [
      // Redirect old paths to new structure if needed
      {
        source: '/login',
        destination: '/auth/login',
        permanent: false,
      },
      {
        source: '/signup',
        destination: '/auth/signup',
        permanent: false,
      },
    ];
  },

  // Rewrites for API routes or external services
  async rewrites() {
    // Only add rewrite if environment variable is properly set and starts with http
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const rewrites = [];
    
    if (supabaseUrl && (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'))) {
      rewrites.push({
        source: '/api/edge/:path*',
        destination: `${supabaseUrl}/functions/v1/:path*`,
      });
    }
    
    return rewrites;
  },

  // Environment variables to expose to client
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Output configuration for deployment
  output: 'standalone',

  // Compression
  compress: true,

  // Power by header
  poweredByHeader: false,

  // Generate ETags for static assets
  generateEtags: true,

  // Page extensions
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],

  // Strict mode for React
  reactStrictMode: true,
};

export default nextConfig;
