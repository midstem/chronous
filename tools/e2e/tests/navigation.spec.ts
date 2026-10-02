import { expect, test } from '@playwright/test'
import {
  getCalendarTitle,
  navigatePeriod,
  openPlayground,
  selectView,
  settle
} from './helpers'

test.describe('period navigation', () => {
  test('navigates next and previous period in month view', async ({ page }) => {
    await openPlayground(page)

    await selectView(page, 'month')
    await settle(page)

    const initialTitle = await getCalendarTitle(page)

    // Navigate to next month
    await navigatePeriod(page, 'next')
    await settle(page)
    const nextTitle = await getCalendarTitle(page)
    expect(nextTitle).not.toBe(initialTitle)

    // Navigate back to initial month
    await navigatePeriod(page, 'prev')
    await settle(page)
    const prevTitle = await getCalendarTitle(page)
    expect(prevTitle).toBe(initialTitle)
  })

  test('navigates next and previous period in week view', async ({ page }) => {
    await openPlayground(page)

    const initialTitle = await getCalendarTitle(page)

    // Next week
    await navigatePeriod(page, 'next')
    await settle(page)
    const nextTitle = await getCalendarTitle(page)
    expect(nextTitle).not.toBe(initialTitle)

    // Previous week
    await navigatePeriod(page, 'prev')
    await settle(page)
    expect(await getCalendarTitle(page)).toBe(initialTitle)
  })

  test('today button navigates back to current period', async ({ page }) => {
    await openPlayground(page)

    // Click next period 3 times to move ahead
    await navigatePeriod(page, 'next')
    await settle(page)
    await navigatePeriod(page, 'next')
    await settle(page)
    await navigatePeriod(page, 'next')
    await settle(page)

    const forwardTitle = await getCalendarTitle(page)

    // Click Today
    await navigatePeriod(page, 'today')
    await settle(page)
    const todayTitle = await getCalendarTitle(page)

    expect(todayTitle).not.toBe(forwardTitle)
  })
})
