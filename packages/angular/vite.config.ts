import angular from '@analogjs/vite-plugin-angular'
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

const CORE_PACKAGE = '@midstem/chronous'

const TEST_TSCONFIG = 'tsconfig.spec.json'

export default defineConfig({
  plugins: [angular({ tsconfig: resolve(TEST_TSCONFIG), jit: false })],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    alias: {
      [CORE_PACKAGE]: resolve('..', 'core', 'src', 'index.ts')
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/test/**', 'src/**/__test__/**'],
      thresholds: { statements: 90, branches: 90, functions: 90, lines: 90 }
    }
  }
})
