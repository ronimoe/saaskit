/// <reference types="@testing-library/jest-dom" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'main-app',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['@testing-library/jest-dom/vitest'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/.next/**'
    ]
  }
}) 