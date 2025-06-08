const { defineConfig } = require('tsup');

const createConfig = (options = {}) => {
  return defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    ...options,
  });
};

const createReactConfig = (options = {}) => {
  return createConfig({
    external: ['react', 'react-dom'],
    ...options,
  });
};

module.exports = {
  createConfig,
  createReactConfig,
};
