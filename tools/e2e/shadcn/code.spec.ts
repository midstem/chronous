import { readFileSync } from 'node:fs'

import { expect, test } from './fixtures'

const SOURCE = readFileSync(
  new URL(
    '../../../registry/default/chronous-calendar/chronous-calendar.tsx',
    import.meta.url
  ),
  'utf8'
)

const INSTALL_COMMAND =
  'npx shadcn@latest add https://midstem.github.io/chronous/r/chronous-calendar.json'

const COMPONENT_PATH = 'components/ui/chronous-calendar.tsx'

test.describe('registry calendar code tab', () => {
  test('offers the shadcn add command', async ({ calendar, page }) => {
    await calendar.goto()
    await calendar.openTab('Code')

    await expect(page.getByRole('tabpanel', { name: 'Command' })).toContainText(
      INSTALL_COMMAND
    )
  })

  test('shows the exact registry source for manual install', async ({
    calendar,
    page
  }) => {
    await calendar.goto()
    await calendar.openTab('Code')
    await calendar.openTab('Manual')

    const file = page.locator('figure', {
      has: page.getByText(COMPONENT_PATH, { exact: true })
    })
    expect(await file.locator('pre code').textContent()).toBe(SOURCE)
  })

  test('copies the component source', async ({
    browserName,
    calendar,
    context,
    page
  }) => {
    test.skip(
      browserName !== 'chromium',
      'clipboard permissions are Chromium-only'
    )
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await calendar.goto()
    await calendar.openTab('Code')
    await calendar.openTab('Manual')

    await page.getByRole('button', { name: `Copy ${COMPONENT_PATH}` }).click()

    await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      SOURCE
    )
  })

  test('keeps the calendar where it was across tabs', async ({ calendar }) => {
    await calendar.goto()
    await calendar.button('Next period').click()

    await calendar.openTab('Code')
    await calendar.openTab('Preview')

    await expect(calendar.caption).toHaveText('Mar 23 – Mar 29')
  })
})
