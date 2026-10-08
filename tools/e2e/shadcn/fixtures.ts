import { test as base, expect } from '@playwright/test'
import { RegistryCalendarPage } from '../pages/registry-calendar'

export const WEDNESDAY_MORNING = '2026-03-18T10:00:00Z'

export const test = base.extend<{ calendar: RegistryCalendarPage }>({
  calendar: async ({ page }, provide): Promise<void> => {
    await page.clock.setFixedTime(WEDNESDAY_MORNING)
    await provide(new RegistryCalendarPage(page))
  }
})

export { expect }
