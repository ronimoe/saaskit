import { defineConfig } from 'vitest/config'
import type { UserConfig } from 'vitest/config'

export const createBaseConfig = (overrides: UserConfig = {}): UserConfig => {
  return defineConfig({
    test: {
      environment: 'node',
      globals: true,
      include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/cypress/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*'
      ],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*'],
        exclude: [
          'src/**/*.d.ts',
          'src/**/*.test.*',
          'src/**/*.spec.*'
        ]
      }
    },
    ...overrides
  })
}

export const createReactConfig = (overrides: UserConfig = {}): UserConfig => {
  return createBaseConfig({
    test: {
      environment: 'jsdom',
      ...overrides.test
    },
    ...overrides
  })
} 