import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

const FILE_NAME_BY_FORMAT: Record<string, string> = {
  es: 'index.js',
  cjs: 'index.cjs'
}

const CORE_PACKAGE = '@midstem/chronous'

const POLYFILL_PACKAGE = 'temporal-polyfill'

export default defineConfig({
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
  },
  plugins: [
    dts({
      bundleTypes: { bundledPackages: [CORE_PACKAGE] },
      compilerOptions: { paths: { '#src/*': ['./src/*/index.ts'] } },
      include: ['src'],
      exclude: ['src/test', 'src/**/__test__/**', 'src/**/*.test.{ts,tsx}']
    })
  ],
  build: {
    lib: {
      entry: resolve('src', 'index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => FILE_NAME_BY_FORMAT[format]
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', POLYFILL_PACKAGE],
      output: { exports: 'named' }
    }
  }
})
