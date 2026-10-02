import { expect, test } from '@playwright/test'
import {
  getActiveView,
  openPlayground,
  resetPlayground,
  selectView,
  settle,
  switchMode
} from './helpers'

test.describe('stage modes and reset', () => {
  test('switches between Calendar and Code modes', async ({ page }) => {
    await openPlayground(page)

    // Initially in Calendar mode
    await expect(page.locator('main header h2')).toBeVisible()

    // Switch to Code mode
    await switchMode(page, 'Code')
    await settle(page)

    // Code snippet should be visible
    const code = page.locator('pre code, pre')
    await expect(code.first()).toBeVisible()
    const codeText = await code.first().innerText()
    expect(codeText).toContain('@midstem/chronous')

    // Switch back to Calendar mode
    await switchMode(page, 'Calendar')
    await settle(page)
    await expect(page.locator('main header h2')).toBeVisible()
  })

  test('reset button restores initial state', async ({ page }) => {
    await openPlayground(page)

    // Change to month view
    await selectView(page, 'month')
    await settle(page)
    expect(await getActiveView(page)).toBe('month')

    // Click Reset
    await resetPlayground(page)
    await settle(page)

    // Should return to default week view
    expect(await getActiveView(page)).toBe('week')
  })
})
