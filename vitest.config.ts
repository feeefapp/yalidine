import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'tests/', '**/*.d.ts', '**/*.config.*', '**/coverage/**'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    setupFiles: [],
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules/', 'dist/'],
  },
  resolve: {
    alias: {
      '@': resolve(currentDir, 'src'),
      '@/types': resolve(currentDir, 'src/types'),
      '@/utils': resolve(currentDir, 'src/utils'),
      '@/core': resolve(currentDir, 'src/core'),
      '@/agents': resolve(currentDir, 'src/agents'),
      '@/database': resolve(currentDir, 'src/database'),
      '@/modules': resolve(currentDir, 'src/modules'),
      '@/errors': resolve(currentDir, 'src/errors'),
    },
  },
})
