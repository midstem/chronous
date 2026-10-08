import { expect, test } from './fixtures'

test.describe('registry calendar environment', () => {
  test.describe('without a timeZone prop', () => {
    test.use({ timezoneId: 'America/Los_Angeles' })

    test('takes today from the browser time zone', async ({
      calendar,
      page
    }) => {
      await page.clock.setFixedTime('2026-03-18T03:00:00Z')
      await calendar.goto({ view: 'day' })

      await expect(calendar.caption).toHaveText('Mar 17')
      await expect(calendar.today).toHaveText('17')
    })
  })

  test('takes today from an explicit timeZone prop', async ({
    calendar,
    page
  }) => {
    await page.clock.setFixedTime('2026-03-18T20:00:00Z')
    await calendar.goto({ view: 'day', tz: 'Asia/Tokyo' })

    await expect(calendar.caption).toHaveText('Mar 19')
  })

  test('formats labels with the locale', async ({ calendar }) => {
    await calendar.goto({ locale: 'de-DE' })

    await expect(calendar.heading).toHaveText('März 2026')
  })

  test('installs Temporal before the calendar renders', async ({
    calendar,
    page
  }) => {
    await calendar.goto()

    expect(
      await page.evaluate(() => typeof Reflect.get(globalThis, 'Temporal'))
    ).toBe('object')
  })

  test('paints events with the theme chart tokens', async ({ calendar }) => {
    await calendar.goto()

    const standup = calendar.event('Standup')
    const lunch = calendar.event('Lunch')
    await expect(standup).toHaveClass(/bg-chart-1\/10/)
    await expect(lunch).toHaveClass(/bg-chart-2\/10/)
    await expect(standup).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  })

  test('follows the dark theme', async ({ calendar, page }) => {
    await calendar.goto({ theme: 'light' })
    const light = await calendar.calendar.evaluate(
      (element) => getComputedStyle(element).backgroundColor
    )

    await page.getByRole('button', { name: 'Use dark theme' }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(calendar.calendar).not.toHaveCSS('background-color', light)
  })

  test('renders every view without console errors', async ({
    calendar,
    page
  }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })

    await calendar.goto()
    for (const view of ['Day', 'Month', 'Agenda', 'Week'] as const) {
      await calendar.selectView(view)
      await calendar.button('Next period').click()
    }

    expect(errors).toEqual([])
  })
})
