import { expect, test } from '@playwright/test'
import { getActiveView, openPlayground, selectPreset, settle } from './helpers'

test.describe('event presets', () => {
  test('switches presets and updates view and events', async ({ page }) => {
    await openPlayground(page)

    // Initially in showcase preset (week view)
    expect(await getActiveView(page)).toBe('week')
    await expect(page.getByText('Standup').first()).toBeVisible()

    // 1. Overlapping columns preset (view: day)
    await selectPreset(page, 'overlaps')
    await settle(page)
    expect(await getActiveView(page)).toBe('day')

    // 2. Recurrence preset (view: month)
    await selectPreset(page, 'recurrence')
    await settle(page)
    expect(await getActiveView(page)).toBe('month')

    // 3. All-day lanes preset (view: week)
    await selectPreset(page, 'allDay')
    await settle(page)
    expect(await getActiveView(page)).toBe('week')

    // 4. No events preset
    await selectPreset(page, 'empty')
    await settle(page)
    await expect(page.getByText('Standup')).toHaveCount(0)

    // 5. Restore showcase preset
    await selectPreset(page, 'showcase')
    await settle(page)
    expect(await getActiveView(page)).toBe('week')
    await expect(page.getByText('Standup').first()).toBeVisible()
  })
})
