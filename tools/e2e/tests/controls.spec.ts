import { expect, test } from './fixtures'

test.describe('sidebar and toolbar controls', () => {
  test('adjusts density across compact cosy and roomy updating grid height', async ({
    playground
  }) => {
    await playground.goto()

    await expect(playground.densityGroup).toBeVisible()
    const dayCol = playground.dayColumn('2026-03-25')

    await playground.selectDensity('compact')
    await expect
      .poll(async () => Math.round((await dayCol.boundingBox())?.height ?? 0))
      .toBe(1056)

    await playground.selectDensity('roomy')
    await expect
      .poll(async () => Math.round((await dayCol.boundingBox())?.height ?? 0))
      .toBe(2016)

    await playground.selectDensity('cosy')
    await expect
      .poll(async () => Math.round((await dayCol.boundingBox())?.height ?? 0))
      .toBe(1440)
  })

  test('updates calendar date when changed from sidebar input', async ({
    playground
  }) => {
    await playground.goto()

    await expect(playground.currentDateInput).toBeVisible()
    await playground.setCurrentDate('2026-11-15')

    await expect(playground.title).toHaveText(/November 2026/)
  })

  test('toggles appearance style modifying markup while preserving events', async ({
    playground
  }) => {
    await playground.goto()

    await expect(playground.styleSelect).toBeVisible()
    await expect(playground.eventsByTitle('Standup').first()).toBeVisible()

    const standupEvent = playground.event('standup')
    const defaultMarkup = await standupEvent.innerHTML()

    await playground.selectStyle('simple')
    await expect(standupEvent).toContainText('Standup')
    await expect
      .poll(async () => standupEvent.innerHTML())
      .not.toBe(defaultMarkup)

    await playground.selectStyle('default')
    await expect.poll(async () => standupEvent.innerHTML()).toBe(defaultMarkup)
  })

  test('shifts first rendered date when weekStartsOn is changed to Sunday', async ({
    playground
  }) => {
    await playground.goto()
    await playground.selectPreset('empty')

    await expect(playground.calendarDays.first()).toHaveAttribute(
      'data-date',
      '2026-03-23'
    )

    await playground.selectWeekStartsOn('0')
    await expect(playground.calendarDays.first()).toHaveAttribute(
      'data-date',
      '2026-03-22'
    )
  })

  test('renders exact three day range in days view with dayCount set to 3', async ({
    playground
  }) => {
    await playground.goto()
    await playground.selectPreset('empty')
    await playground.selectView('days')

    await playground.setDayCount(3)

    await expect(playground.metric('days')).toHaveText('3')
    await expect(playground.calendarDays.nth(0)).toHaveAttribute(
      'data-date',
      '2026-03-25'
    )
    await expect(playground.calendarDays.nth(1)).toHaveAttribute(
      'data-date',
      '2026-03-26'
    )
    await expect(playground.calendarDays.nth(2)).toHaveAttribute(
      'data-date',
      '2026-03-27'
    )
  })

  test('renders 48 slots on normal day when slotMinutes is set to 30', async ({
    playground
  }) => {
    await playground.goto()
    await playground.selectPreset('empty')
    await playground.selectView('day')

    await playground.setSlotMinutes(30)

    await expect(playground.metric('slots')).toHaveText('48')
    await expect(playground.slots('2026-03-25')).toHaveCount(48)
  })

  test('changes agenda day range when dayCount is modified', async ({
    playground
  }) => {
    await playground.goto()
    await playground.selectPreset('empty')
    await playground.selectView('agenda')

    await playground.setDayCount(5)

    await expect(playground.metric('days')).toHaveText('5')
    await expect(playground.agendaDays).toHaveCount(5)
  })

  test('updates header locale and timezone utc offsets from dropdowns', async ({
    playground
  }) => {
    await playground.goto()
    await playground.selectPreset('empty')

    await playground.selectLocale('uk-UA')
    await expect(playground.title).toHaveText(/берез.*2026/)

    await playground.selectLocale('en-GB')
    await expect(playground.title).toHaveText(/March 2026/)

    await expect(playground.metric('start')).toContainText('+02:00')

    await playground.selectTimeZone('UTC')
    await expect(playground.metric('start')).toContainText('+00:00')

    await playground.selectTimeZone('America/New_York')
    await expect(playground.metric('start')).toContainText('-04:00')
  })
})
