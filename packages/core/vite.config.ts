import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

const FILE_NAME_BY_FORMAT: Record<string, string> = {
  es: 'index.js',
  cjs: 'index.cjs'
}

export default defineConfig({
  test: {
    environment: 'node'
  },
  plugins: [
    dts({
      bundleTypes: true,
      compilerOptions: { paths: { '#src/*': ['./src/*/index.ts'] } },
      include: ['src'],
      exclude: ['src/**/__test__/**', 'src/**/*.test.ts']
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
