import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Global configuration
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts', './src/test/msw-setup.ts'],

    // CSS and assets
    css: true,

    // Test patterns
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'tests/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'components/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'lib/**/*.{test,spec}.{js,jsx,ts,tsx}',
    ],
    exclude: [
      'node_modules',
      'dist',
      '.next',
      'coverage',
      'tests/e2e/**',
      '**/*.stories.{js,jsx,ts,tsx}',
    ],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'text-summary'],
      reportsDirectory: './coverage',
      include: [
        'src/**/*.{js,jsx,ts,tsx}',
        'components/**/*.{js,jsx,ts,tsx}',
        'lib/**/*.{js,jsx,ts,tsx}',
      ],
      exclude: [
        '**/*.d.ts',
        '**/*.stories.{js,jsx,ts,tsx}',
        '**/index.{js,jsx,ts,tsx}',
        'src/test/**',
        '**/*.config.{js,ts}',
        '**/types/**',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },

    // Performance - Vitest 4 syntax
    maxWorkers: 8,
    isolate: true,

    // Timeout configuration
    testTimeout: 15000,
    hookTimeout: 15000,

    // Reporters
    reporters: ['verbose'],

    // Mock configuration
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,

    // Retry configuration for flaky tests
    retry: 1,

    // Concurrent execution
    maxConcurrency: 8,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
