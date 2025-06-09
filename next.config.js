const path = require('path')

// Load environment variables from project root
require('dotenv').config({ path: path.resolve(__dirname, '.env') })

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@saas/auth',
    '@saas/billing',
    '@saas/email',
    '@saas/lib',
    '@saas/supabase',
    '@saas/types',
    '@saas/ui',
  ],
  experimental: {
    optimizePackageImports: ['@saas/ui'],
  },
  
  // Exclude test files from production builds
  webpack: (config, { isServer }) => {
    // Exclude test files from the build
    config.module.rules.push({
      test: /\.(test|spec)\.(js|jsx|ts|tsx)$/,
      loader: 'ignore-loader'
    });
    
    return config;
  },
}

module.exports = nextConfig 