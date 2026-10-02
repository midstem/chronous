import { expect, test } from './fixtures'

test.describe('calendar views', () => {
  test('switches across calendar views updating ranges and visible events', async ({
    playground
  }) => {
    await playground.goto()

    await expect.poll(async () => playground.getActiveView()).toBe('week')
    await expect(playground.metric('days')).toHaveText('7')
    await expect(playground.eventsByTitle('Standup').first()).toBeVisible()
    await expect(playground.dayHeading('2026-03-23')).toBeVisible()
    await expect(playground.dayHeading('2026-03-29')).toBeVisible()

    await playground.selectView('month')
    await expect.poll(async () => playground.getActiveView()).toBe('month')
    await expect(playground.metric('view')).toHaveText('month')
    await expect(playground.title).toHaveText(/March 2026/)
    await expect(playground.monthDays.first()).toBeVisible()

    await playground.selectView('day')
    await expect.poll(async () => playground.getActiveView()).toBe('day')
    await expect(playground.metric('view')).toHaveText('day')
    await expect(playground.metric('days')).toHaveText('1')
    const march25Column = playground.dayColumn('2026-03-25')
    await expect(march25Column).toBeVisible()
    await expect(playground.eventsByTitle('Standup', '2026-03-25')).toHaveCount(
      0
    )
    await expect(
      playground.eventsByTitle('Night shift', '2026-03-25')
    ).toBeVisible()

    await playground.selectView('days')
    await expect.poll(async () => playground.getActiveView()).toBe('days')
    await expect(playground.metric('view')).toHaveText('days')
    await expect(playground.metric('days')).toHaveText('7')
    await expect(playground.dayHeading('2026-03-25')).toBeVisible()
    await expect(playground.dayHeading('2026-03-31')).toBeVisible()

    await playground.selectView('agenda')
    await expect.poll(async () => playground.getActiveView()).toBe('agenda')
    await expect(playground.metric('view')).toHaveText('agenda')
    await expect(playground.agendaDays.first()).toBeVisible()

    await playground.selectView('week')
    await expect.poll(async () => playground.getActiveView()).toBe('week')
    await expect(playground.metric('view')).toHaveText('week')
    await expect(playground.eventsByTitle('Standup').first()).toBeVisible()
  })

  test('synchronizes view selection from sidebar dropdown', async ({
    playground
  }) => {
    await playground.goto()

    await expect(playground.viewSelect).toBeVisible()

    await playground.selectSidebarView('month')
    await expect.poll(async () => playground.getActiveView()).toBe('month')
    await expect(playground.metric('view')).toHaveText('month')

    await playground.selectSidebarView('agenda')
    await expect.poll(async () => playground.getActiveView()).toBe('agenda')
    await expect(playground.metric('view')).toHaveText('agenda')

    await playground.selectSidebarView('week')
    await expect.poll(async () => playground.getActiveView()).toBe('week')
    await expect(playground.metric('view')).toHaveText('week')
  })
})
