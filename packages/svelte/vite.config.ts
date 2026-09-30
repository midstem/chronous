import { resolve } from 'node:path'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svelteTesting } from '@testing-library/svelte/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: { '@midstem/chronous': resolve('..', 'core', 'src', 'index.ts') }
  },
  plugins: [svelte(), svelteTesting({ resolveBrowser: false })],
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve('src', 'engine.ts'),
      formats: ['es'],
      fileName: () => 'engine.js'
    },
    rollupOptions: { external: ['svelte', 'svelte/store'] }
  },
  test: {
    projects: [
      {
        extends: true,
        resolve: { conditions: ['browser', 'development'] },
        test: {
          name: 'dom',
          environment: 'jsdom',
          setupFiles: ['./tests/setup.ts'],
          include: ['tests/components.test.ts', 'tests/api.test.ts']
        }
      },
      {
        extends: true,
        resolve: { conditions: ['node', 'development'] },
        test: {
          name: 'ssr',
          environment: 'node',
          include: ['tests/ssr.test.ts']
        }
      }
    ]
  }
})
