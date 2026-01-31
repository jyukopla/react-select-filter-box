/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
      '@/components': path.resolve(dirname, './src/components'),
      '@/hooks': path.resolve(dirname, './src/hooks'),
      '@/types': path.resolve(dirname, './src/types'),
      '@/utils': path.resolve(dirname, './src/utils'),
      '@/core': path.resolve(dirname, './src/core'),
      '@/autocompleters': path.resolve(dirname, './src/autocompleters'),
      '@/schemas': path.resolve(dirname, './src/schemas'),
    },
  },
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}',
        'src/test/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/stories/**',
        'src/index.ts',
        'src/App.tsx',
        'src/index.css',
        'src/App.css',
      ],
      thresholds: {
        // Note: 100% is the target, but currently set to 80% to allow gradual improvement
        // Increase these thresholds as coverage improves
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
    projects: [
      // Unit tests project
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['src/**/*.{test,spec}.{ts,tsx}'],
          exclude: ['src/**/*.stories.{ts,tsx}'],
          setupFiles: ['./src/test/setup.ts'],
        },
      },
      // Storybook tests project
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
})
