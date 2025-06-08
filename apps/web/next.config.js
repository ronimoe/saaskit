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
}

module.exports = nextConfig 