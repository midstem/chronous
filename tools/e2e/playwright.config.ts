import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'
import { PLAYGROUNDS } from './playgrounds'

const browserName = process.env.BROWSER || 'chromium'
const validBrowsers = ['chromium', 'firefox', 'webkit'] as const
if (
  process.env.BROWSER &&
  !validBrowsers.includes(process.env.BROWSER as (typeof validBrowsers)[number])
) {
  throw new Error(
    `Invalid BROWSER selector: "${process.env.BROWSER}". Expected one of: ${validBrowsers.join(', ')}`
  )
}

const device =
  browserName === 'firefox'
    ? devices['Desktop Firefox']
    : browserName === 'webkit'
      ? devices['Desktop Safari']
      : devices['Desktop Chrome']

const validPlaygroundIds = PLAYGROUNDS.map((pg) => pg.id)
const playgroundEnv = process.env.PLAYGROUND?.trim()
if (playgroundEnv && !validPlaygroundIds.includes(playgroundEnv)) {
  throw new Error(
    `Invalid PLAYGROUND selector: "${playgroundEnv}". Expected one of: ${validPlaygroundIds.join(', ')}`
  )
}

const activePlaygrounds = playgroundEnv
  ? PLAYGROUNDS.filter((pg) => pg.id === playgroundEnv)
  : PLAYGROUNDS

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,
  retries: process.env.CI ? 1 : 0,
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 30_000,
  expect: { timeout: 7_000 },
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure'
  },
  projects: activePlaygrounds.map((pg) => ({
    name: pg.id,
    use: {
      baseURL: `http://localhost:${pg.port}`,
      ...device
    }
  })),
  webServer: activePlaygrounds.map((pg) => ({
    command: `npx vite --port ${pg.port} --strictPort --no-open`,
    cwd: fileURLToPath(new URL(pg.path, import.meta.url)),
    url: `http://localhost:${pg.port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }))
})
