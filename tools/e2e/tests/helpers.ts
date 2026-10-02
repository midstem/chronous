import { expect, type Page } from '@playwright/test'

export const openPlayground = async (page: Page): Promise<void> => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Chronous' })).toBeVisible()
  await expect(page.locator('main header h2')).toBeVisible()
}

export const getCalendarTitle = async (page: Page): Promise<string> => {
  const heading = page.locator('main header h2')
  await expect(heading).toBeVisible()
  return (await heading.innerText()).trim()
}

export const selectView = async (
  page: Page,
  view: 'day' | 'week' | 'days' | 'month' | 'agenda'
): Promise<void> => {
  const viewGroup = page.locator('div[role="group"][aria-label="View"]')
  const viewButton = viewGroup.getByRole('button', { name: view, exact: true })
  await viewButton.click()
  await expect(viewButton).toHaveAttribute('aria-pressed', 'true')
}

export const getActiveView = async (page: Page): Promise<string> => {
  const activeBtn = page.locator(
    'div[role="group"][aria-label="View"] button[aria-pressed="true"]'
  )
  return (await activeBtn.innerText()).trim().toLowerCase()
}

export const navigatePeriod = async (
  page: Page,
  direction: 'prev' | 'next' | 'today'
): Promise<void> => {
  if (direction === 'prev') {
    await page.getByRole('button', { name: 'Previous period' }).click()
  } else if (direction === 'next') {
    await page.getByRole('button', { name: 'Next period' }).click()
  } else {
    await page.getByRole('button', { name: 'Today' }).click()
  }
}

export const selectPreset = async (
  page: Page,
  presetValue: string
): Promise<void> => {
  const select = page
    .getByLabel('preset')
    .or(page.locator('select#preset, select[data-field="preset"]'))
  await select.first().selectOption(presetValue)
}

export const selectDensity = async (
  page: Page,
  density: 'compact' | 'cosy' | 'roomy'
): Promise<void> => {
  const group = page.locator('div[role="group"][aria-label="Row height"]')
  const btn = group.locator(`button[title^="${density}"]`)
  await btn.click()
  await expect(btn).toHaveAttribute('aria-pressed', 'true')
}

export const switchMode = async (
  page: Page,
  mode: 'Calendar' | 'Code'
): Promise<void> => {
  const btn = page.getByRole('button', { name: mode, exact: true })
  await btn.click()
  await expect(btn).toHaveAttribute('aria-pressed', 'true')
}

export const resetPlayground = async (page: Page): Promise<void> => {
  await page.getByRole('button', { name: 'Reset' }).click()
}

export const switchSidebarTab = async (
  page: Page,
  tab: 'Options' | 'Events'
): Promise<void> => {
  const tabButton = page
    .getByRole('button', { name: tab, exact: true })
    .or(page.getByRole('tab', { name: tab, exact: true }))
  await tabButton.first().click()
}

export const settle = async (page: Page, ms = 300): Promise<void> => {
  await page.waitForTimeout(ms)
}
