import { expect, test } from '@playwright/test'
import {
  getCalendarTitle,
  openPlayground,
  selectDensity,
  settle
} from './helpers'

test.describe('sidebar and toolbar controls', () => {
  test('adjusts density between Compact, Cosy and Roomy', async ({ page }) => {
    await openPlayground(page)

    // Row height control is visible in week view
    const densityGroup = page.locator(
      'div[role="group"][aria-label="Row height"]'
    )
    await expect(densityGroup).toBeVisible()

    // Select Compact
    await selectDensity(page, 'compact')
    await settle(page)
    const compactBtn = densityGroup.locator('button[title^="compact"]')
    await expect(compactBtn).toHaveAttribute('aria-pressed', 'true')

    // Select Roomy
    await selectDensity(page, 'roomy')
    await settle(page)
    const roomyBtn = densityGroup.locator('button[title^="roomy"]')
    await expect(roomyBtn).toHaveAttribute('aria-pressed', 'true')

    // Select Cosy
    await selectDensity(page, 'cosy')
    await settle(page)
    const cosyBtn = densityGroup.locator('button[title^="cosy"]')
    await expect(cosyBtn).toHaveAttribute('aria-pressed', 'true')
  })

  test('changes date from sidebar input', async ({ page }) => {
    await openPlayground(page)

    const dateInput = page.locator(
      'input[type="date"], input#currentDate, input[data-field="currentDate"]'
    )
    await expect(dateInput.first()).toBeVisible()

    const initialTitle = await getCalendarTitle(page)

    // Fill a different date (e.g. November 2026)
    await dateInput.first().fill('2026-11-15')
    await dateInput.first().dispatchEvent('change')
    await settle(page)

    const newTitle = await getCalendarTitle(page)
    expect(newTitle).not.toBe(initialTitle)
  })

  test('toggles appearance style between default and simple', async ({
    page
  }) => {
    await openPlayground(page)

    const styleSelect = page
      .getByLabel('style')
      .or(page.locator('select#style, select[data-field="style"]'))
    await expect(styleSelect.first()).toBeVisible()

    // Switch to simple
    await styleSelect.first().selectOption('simple')
    await settle(page)

    // Switch back to default
    await styleSelect.first().selectOption('default')
    await settle(page)
  })
})
