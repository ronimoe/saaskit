import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript and ESLint settings
  typescript: {
    // Dangerously allow production builds to successfully complete even if your project has type errors
    ignoreBuildErrors: false,
  },
  eslint: {
    // Disable ESLint during builds to prevent test file conflicts
    ignoreDuringBuilds: true,
    // Exclude test files from ESLint during builds
    dirs: ['app', 'components', 'lib', 'utils', 'types'],
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
    // Enable webpack build worker for better performance
    webpackBuildWorker: true,
    // Optimize memory usage
    memoryBasedWorkersCount: true,
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
    // Optimize webpack cache performance
    config.cache = {
      ...config.cache,
      // Reduce cache serialization overhead
      maxGenerations: 1,
      // Use memory cache for better performance
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    };

    // Suppress webpack cache warnings and Supabase realtime-js dynamic import warnings
    config.ignoreWarnings = [
      {
        module: /node_modules\/@supabase\/realtime-js/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
      // Suppress large string cache warnings
      /Serializing big strings/,
    ];

    // Exclude test files from webpack processing completely
    config.module.rules.push({
      test: /\.(test|spec)\.(ts|tsx|js|jsx)$/,
      type: 'javascript/auto',
      use: 'null-loader',
    });

    // Exclude test directories
    config.module.rules.push({
      test: /[\\/](__tests__|__mocks__)[\\/].*\.(ts|tsx|js|jsx)$/,
      type: 'javascript/auto', 
      use: 'null-loader',
    });

    // Exclude Jest config files
    config.module.rules.push({
      test: /jest\.(config|setup)\.(ts|js|mjs)$/,
      type: 'javascript/auto',
      use: 'null-loader',
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

    // Optimize module concatenation to reduce large string generation
    config.optimization = {
      ...config.optimization,
      concatenateModules: true,
      // Split chunks to avoid large bundles that create big strings
      splitChunks: {
        ...config.optimization?.splitChunks,
        chunks: 'all',
        maxSize: 244000, // 244KB max chunk size
        cacheGroups: {
          ...config.optimization?.splitChunks?.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 244000,
          },
        },
      },
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
      // Redirect old auth paths to new structure if needed
      {
        source: '/auth/login',
        destination: '/login',
        permanent: false,
      },
      {
        source: '/auth/signup',
        destination: '/login',
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

  // Page extensions - exclude test files by not including test extensions
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],

  // Strict mode for React
  reactStrictMode: true,
};

export default nextConfig;
