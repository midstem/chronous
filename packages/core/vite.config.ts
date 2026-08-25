import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

const FILE_NAME_BY_FORMAT: Record<string, string> = {
  es: 'index.js',
  cjs: 'index.cjs'
}

const NATIVE_TEMPORAL_FLAG = '--harmony-temporal'

const usesNativeTemporal = process.env.CHRONOUS_TEMPORAL === 'native'

export default defineConfig({
  test: {
    environment: 'node',
    pool: 'forks',
    execArgv: usesNativeTemporal ? [NATIVE_TEMPORAL_FLAG] : [],
    setupFiles: usesNativeTemporal ? [] : ['./src/test/setup.ts'],
    benchmark: { include: ['src/**/*.bench.ts'] },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/test/**', 'src/bench/**', 'src/**/__test__/**'],
      thresholds: { statements: 90, branches: 90, functions: 90, lines: 90 }
    }
  },
  plugins: [
    dts({
      bundleTypes: true,
      compilerOptions: { paths: { '#src/*': ['./src/*/index.ts'] } },
      include: ['src'],
      exclude: [
        'src/test',
        'src/bench',
        'src/**/__test__/**',
        'src/**/*.test.ts',
        'src/**/*.bench.ts'
      ]
    })
  ],
  build: {
    lib: {
      entry: resolve('src', 'index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => FILE_NAME_BY_FORMAT[format]
    },
    rollupOptions: {
      output: { exports: 'named' }
    }
  }
})
