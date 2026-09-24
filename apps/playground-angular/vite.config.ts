import angular from '@analogjs/vite-plugin-angular'
import tailwindcss from '@tailwindcss/vite'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  base: './',
  plugins: [
    angular({ tsconfig: resolve(__dirname, 'tsconfig.json') }),
    tailwindcss()
  ],
  server: { open: true, port: 5174 },
  test: {
    environment: 'node',
    include: ['src/**/__test__/**/*.test.ts'],
    passWithNoTests: true
  }
})
