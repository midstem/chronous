import { expect, test } from '@playwright/test'
import { getActiveView, getCalendarTitle, openPlayground } from './helpers'

test.describe('initial render', () => {
  test('loads playground with masthead and navigation', async ({ page }) => {
    await openPlayground(page)

    await expect(page.getByRole('heading', { name: 'Chronous' })).toBeVisible()
    await expect(page.locator('h1').getByText('playground')).toBeVisible()

    // Masthead buttons
    await expect(page.getByRole('button', { name: 'Calendar' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Code' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible()

    // Title of the calendar exists
    const title = await getCalendarTitle(page)
    expect(title.length).toBeGreaterThan(0)
  })

  test('starts in week view with showcase events', async ({ page }) => {
    await openPlayground(page)

    expect(await getActiveView(page)).toBe('week')

    // Verify showcase events are present on the board
    await expect(
      page.locator('main').getByText('Standup').first()
    ).toBeVisible()
  })

  test('renders engine state details with scalar data', async ({ page }) => {
    await openPlayground(page)

    const details = page.locator('details')
    await expect(details.first()).toBeVisible()

    // Clicking summary reveals pre with JSON
    await details.first().locator('summary').click()
    const pre = details.first().locator('pre')
    await expect(pre).toBeVisible()

    const jsonText = await pre.innerText()
    const parsed = JSON.parse(jsonText) as Record<string, unknown>
    expect(parsed).toHaveProperty('days')
    expect(parsed).toHaveProperty('view')
  })
})
