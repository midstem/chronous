import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: './',
  plugins: [vue(), tailwindcss()],
  server: { open: true, port: 5175 },
  test: {
    environment: 'node',
    include: ['src/**/__test__/**/*.test.ts']
  }
})
