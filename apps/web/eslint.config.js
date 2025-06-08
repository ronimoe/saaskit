const { createRequire } = require('module');
const require = createRequire(import.meta.url);

const nextConfig = require('@repo/eslint-config/next');

const config = [
  ...nextConfig,
];

export default config; 