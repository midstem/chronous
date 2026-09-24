import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: './',
  plugins: [tailwindcss()],
  server: { open: true },
  test: {
    environment: 'node',
    include: ['src/**/__test__/**/*.test.ts']
  }
})
