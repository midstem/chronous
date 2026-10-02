import { expect, test } from './fixtures'

test.describe('period navigation', () => {
  test('navigates periods in month view with exact dates', async ({
    playground,
    page
  }) => {
    await page.clock.setFixedTime('2026-03-25T12:00:00Z')
    await playground.goto()

    await playground.selectView('month')
    const initialTitle = (await playground.title.innerText()).trim()
    expect(initialTitle).toContain('March 2026')
    await expect(playground.currentDateInput).toHaveValue('2026-03-25')

    await playground.navigatePeriod('next')
    await expect(playground.title).toHaveText(/April 2026/)
    await expect(playground.currentDateInput).toHaveValue('2026-04-01')

    await playground.navigatePeriod('prev')
    await expect(playground.title).toHaveText(/March 2026/)
    await expect(playground.currentDateInput).toHaveValue('2026-03-01')
  })

  test('navigates periods in week view with exact dates', async ({
    playground,
    page
  }) => {
    await page.clock.setFixedTime('2026-03-25T12:00:00Z')
    await playground.goto()

    await expect(playground.currentDateInput).toHaveValue('2026-03-25')
    await expect(playground.metric('start')).toContainText('2026-03-23')
    await expect(playground.dayHeading('2026-03-23')).toBeVisible()
    await expect(playground.dayHeading('2026-03-29')).toBeVisible()

    await playground.navigatePeriod('next')
    await expect(playground.currentDateInput).toHaveValue('2026-04-01')
    await expect(playground.metric('start')).toContainText('2026-03-30')
    await expect(playground.dayHeading('2026-03-30')).toBeVisible()
    await expect(playground.dayHeading('2026-04-05')).toBeVisible()

    await playground.navigatePeriod('prev')
    await expect(playground.currentDateInput).toHaveValue('2026-03-25')
    await expect(playground.metric('start')).toContainText('2026-03-23')
    await expect(playground.dayHeading('2026-03-23')).toBeVisible()
  })

  test('restores fixed current period when clicking today', async ({
    playground,
    page
  }) => {
    await page.clock.setFixedTime('2026-03-25T12:00:00Z')
    await playground.goto()

    await playground.navigatePeriod('next')
    await playground.navigatePeriod('next')
    await playground.navigatePeriod('next')

    await expect(playground.currentDateInput).toHaveValue('2026-04-15')
    await expect(playground.metric('start')).toContainText('2026-04-13')

    await playground.navigatePeriod('today')
    await expect(playground.currentDateInput).toHaveValue('2026-03-25')
    await expect(playground.metric('start')).toContainText('2026-03-23')
    await expect(playground.title).toHaveText(/March 2026/)
  })
})
