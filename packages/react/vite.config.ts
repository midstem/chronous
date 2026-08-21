import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

const FILE_NAME_BY_FORMAT: Record<string, string> = {
  es: 'index.js',
  cjs: 'index.cjs'
}

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    alias: {
      '@midstem/chronous': resolve('..', 'core', 'src', 'index.ts')
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
      bundleTypes: true,
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
      external: ['@midstem/chronous', 'react', 'react/jsx-runtime'],
      output: { exports: 'named' }
    }
  }
})
