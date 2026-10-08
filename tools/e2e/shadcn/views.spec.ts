import { expect, test } from './fixtures'

test.describe('registry calendar views', () => {
  test('opens on the week around today with the demo events', async ({
    calendar
  }) => {
    await calendar.goto()

    await expect(calendar.heading).toHaveText('March 2026')
    await expect(calendar.caption).toHaveText('Mar 16 – Mar 22')
    await expect(calendar.view('Week')).toHaveAttribute('aria-pressed', 'true')
    await expect(calendar.today).toHaveCount(1)
    await expect(calendar.today).toHaveText('18')
    await expect(calendar.event('Daily standup')).toHaveCount(5)
    await expect(calendar.event('Team offsite')).toBeVisible()
  })

  test('switches between day, week, month and agenda', async ({ calendar }) => {
    await calendar.goto()

    await calendar.selectView('Day')
    await expect(calendar.view('Day')).toHaveAttribute('aria-pressed', 'true')
    await expect(calendar.view('Week')).toHaveAttribute('aria-pressed', 'false')
    await expect(calendar.caption).toHaveText('Mar 18')
    await expect(calendar.region('Calendar days')).toBeVisible()

    await calendar.selectView('Month')
    await expect(calendar.region('Calendar month')).toBeVisible()
    await expect(calendar.caption).toHaveCount(0)

    await calendar.selectView('Agenda')
    await expect(calendar.region('Calendar agenda')).toBeVisible()
    await expect(calendar.caption).toHaveText('Mar 18 – Apr 16')
    await expect(calendar.event('Sprint planning').first()).toBeVisible()
    await expect(calendar.event('Team offsite').first()).toContainText(
      'All day'
    )

    await calendar.selectView('Week')
    await expect(calendar.caption).toHaveText('Mar 16 – Mar 22')
  })

  test('caps a month day at two events and counts the rest', async ({
    calendar
  }) => {
    await calendar.goto({ view: 'month' })

    const busyDay = calendar.monthDay('2026-03-18')
    await expect(busyDay.getByText('+2 more')).toBeVisible()
    await expect(busyDay.locator('[data-slot="calendar-event"]')).toHaveText([
      /Morning run/,
      /Daily standup/
    ])
  })

  test('shows an empty state for an agenda without events', async ({
    calendar
  }) => {
    await calendar.goto({ view: 'agenda', events: 'none' })

    await expect(
      calendar.calendar.getByText('No events in this period')
    ).toBeVisible()
  })

  test('honours defaultDate and defaultView', async ({ calendar }) => {
    await calendar.goto({ view: 'month', date: '2026-07-01' })

    await expect(calendar.heading).toHaveText('July 2026')
    await expect(calendar.view('Month')).toHaveAttribute('aria-pressed', 'true')
    await expect(calendar.today).toHaveCount(0)
  })

  test('opens the time grid at 8 AM', async ({ calendar }) => {
    await calendar.goto()

    const times = calendar.region('Calendar times')
    await times.scrollIntoViewIfNeeded()
    await expect
      .poll(() => times.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(400)
    await expect(times.getByText('08:00 AM')).toBeInViewport()
  })
})
