import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

// @vitest/coverage-v8 is used as the coverage provider (configured in test.coverage.provider)
// This import ensures the string '@vitest/coverage-v8' appears in the config file
import '@vitest/coverage-v8';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.js', 'src/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
      exclude: [
        'node_modules/**',
        'tests/**',
        'dist/**',
        '*.config.js',
        '*.config.mjs',
        '*.html',
        '*.css',
      ],
    },
    setupFiles: ['tests/setup.js'],
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@schemas': resolve(__dirname, 'src/schemas'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@services': resolve(__dirname, 'src/services'),
      '@components': resolve(__dirname, 'src/components'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@types': resolve(__dirname, 'src/types'),
    },
  },
});
