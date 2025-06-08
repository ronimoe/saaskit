import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  
  // Exclude test files from production builds
  webpack: (config, { isServer }) => {
    // Exclude test files from the build
    config.module.rules.push({
      test: /\.(test|spec)\.(js|jsx|ts|tsx)$/,
      loader: 'ignore-loader'
    });
    
    return config;
  },
  
  // Exclude test directories from static file serving
  async rewrites() {
    return [];
  }
};

export default nextConfig;
