import tailwindcss from '@tailwindcss/vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svelteTesting } from '@testing-library/svelte/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: './',
  resolve: { conditions: ['browser', 'development'] },
  plugins: [svelte(), svelteTesting({ resolveBrowser: false }), tailwindcss()],
  server: { open: true, port: 5176 },
  test: {
    environment: 'jsdom',
    include: ['src/**/__test__/**/*.test.ts'],
    setupFiles: ['./src/test-setup.ts']
  }
})
