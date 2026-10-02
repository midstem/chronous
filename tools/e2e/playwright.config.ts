import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'
import { PLAYGROUNDS } from './playgrounds'

const browserName = process.env.BROWSER || 'chromium'
const device =
  browserName === 'firefox'
    ? devices['Desktop Firefox']
    : browserName === 'webkit'
      ? devices['Desktop Safari']
      : devices['Desktop Chrome']

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  timeout: 30_000,
  expect: { timeout: 7_000 },
  use: {
    trace: 'retain-on-failure',
    video: 'retain-on-failure'
  },
  projects: PLAYGROUNDS.map((pg) => ({
    name: pg.id,
    use: {
      baseURL: `http://localhost:${pg.port}`,
      ...device
    }
  })),
  webServer: PLAYGROUNDS.map((pg) => ({
    command: `npx vite --port ${pg.port} --strictPort --no-open`,
    cwd: fileURLToPath(new URL(pg.path, import.meta.url)),
    url: `http://localhost:${pg.port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }))
})
