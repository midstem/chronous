import { expect, test } from '@playwright/test'
import { getActiveView, openPlayground, selectView, settle } from './helpers'

test.describe('calendar views', () => {
  test('switches between all 5 views via toolbar buttons', async ({ page }) => {
    await openPlayground(page)

    // Default view is week
    expect(await getActiveView(page)).toBe('week')

    // 1. Month view
    await selectView(page, 'month')
    await settle(page)
    expect(await getActiveView(page)).toBe('month')
    const monthDays = page.locator('[data-in-current-period]')
    await expect(monthDays.first()).toBeVisible()

    // 2. Day view
    await selectView(page, 'day')
    await settle(page)
    expect(await getActiveView(page)).toBe('day')
    await expect(page.locator('text=09:00').first()).toBeVisible()

    // 3. Days view
    await selectView(page, 'days')
    await settle(page)
    expect(await getActiveView(page)).toBe('days')
    await expect(page.locator('text=09:00').first()).toBeVisible()

    // 4. Agenda view
    await selectView(page, 'agenda')
    await settle(page)
    expect(await getActiveView(page)).toBe('agenda')

    // 5. Back to week view
    await selectView(page, 'week')
    await settle(page)
    expect(await getActiveView(page)).toBe('week')
    await expect(
      page.locator('main').getByText('Standup').first()
    ).toBeVisible()
  })

  test('synchronizes view change from sidebar select', async ({ page }) => {
    await openPlayground(page)

    const viewSelect = page
      .getByLabel('view')
      .or(page.locator('select#view, select[data-field="view"]'))
    await expect(viewSelect.first()).toBeVisible()

    // Switch to month via sidebar
    await viewSelect.first().selectOption('month')
    await settle(page)
    expect(await getActiveView(page)).toBe('month')

    // Switch to agenda via sidebar
    await viewSelect.first().selectOption('agenda')
    await settle(page)
    expect(await getActiveView(page)).toBe('agenda')

    // Switch back to week via sidebar
    await viewSelect.first().selectOption('week')
    await settle(page)
    expect(await getActiveView(page)).toBe('week')
  })
})
