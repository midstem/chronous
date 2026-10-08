import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const REGISTRY_CALENDAR = fileURLToPath(
  new URL(
    '../../registry/default/chronous-calendar/chronous-calendar.tsx',
    import.meta.url
  )
)

const SOURCE = fileURLToPath(new URL('./src/', import.meta.url))

export default defineConfig({
  base: './',
  plugins: [tailwindcss()],
  resolve: {
    alias: [
      {
        find: '@/components/ui/chronous-calendar',
        replacement: REGISTRY_CALENDAR
      },
      { find: /^@\//, replacement: SOURCE }
    ]
  }
})
