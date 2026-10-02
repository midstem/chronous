import { expect, test } from './fixtures'

test.describe('event presets', () => {
  test('switches presets and updates view and events', async ({
    playground
  }) => {
    await playground.goto()

    await expect.poll(async () => playground.getActiveView()).toBe('week')
    await expect(playground.eventsByTitle('Standup').first()).toBeVisible()

    await playground.selectPreset('overlaps')
    await expect.poll(async () => playground.getActiveView()).toBe('day')

    await playground.selectPreset('recurrence')
    await expect.poll(async () => playground.getActiveView()).toBe('month')

    await playground.selectPreset('allDay')
    await expect.poll(async () => playground.getActiveView()).toBe('week')

    await playground.selectPreset('empty')
    await expect(playground.eventsByTitle('Standup')).toHaveCount(0)

    await playground.selectPreset('showcase')
    await expect.poll(async () => playground.getActiveView()).toBe('week')
    await expect(playground.eventsByTitle('Standup').first()).toBeVisible()
  })

  test('overlapping preset renders distinct columns during overlap and night event split', async ({
    playground
  }) => {
    await playground.goto()
    await playground.selectPreset('overlaps')
    await expect.poll(async () => playground.getActiveView()).toBe('day')

    const dayColumn = playground.dayColumn('2026-03-24')
    await expect(dayColumn).toBeVisible()

    const kickoff = playground.eventInDay('2026-03-24', 'kickoff')
    const design = playground.eventInDay('2026-03-24', 'design')
    const backend = playground.eventInDay('2026-03-24', 'backend')
    const triage = playground.eventInDay('2026-03-24', 'triage')

    await expect(kickoff).toBeVisible()
    await expect(design).toBeVisible()
    await expect(backend).toBeVisible()
    await expect(triage).toBeVisible()

    const dayBox = await dayColumn.boundingBox()
    const kickoffBox = await kickoff.boundingBox()
    const designBox = await design.boundingBox()
    const backendBox = await backend.boundingBox()
    const triageBox = await triage.boundingBox()

    for (const box of [kickoffBox, designBox, backendBox, triageBox]) {
      expect(box).not.toBeNull()
      expect(box!.width).toBeGreaterThan(0)
      expect(box!.width).toBeLessThanOrEqual(dayBox!.width)
    }

    expect(kickoffBox!.x).toBeLessThan(designBox!.x)
    expect(designBox!.x).toBeLessThan(backendBox!.x)
    expect(backendBox!.x).toBeLessThan(triageBox!.x)

    await playground.selectPreset('showcase')
    const night25 = playground.eventInDay('2026-03-25', 'night')
    await expect(night25).toHaveAttribute('data-continues-before', 'false')
    await expect(night25).toHaveAttribute('data-continues-after', 'true')

    const night26 = playground.eventInDay('2026-03-26', 'night')
    await expect(night26).toHaveAttribute('data-continues-before', 'true')
    await expect(night26).toHaveAttribute('data-continues-after', 'false')
  })

  test('allDay preset renders proportional bars, distinct lanes, and wall-hour promotion', async ({
    playground
  }) => {
    await playground.goto()
    await playground.selectPreset('allDay')
    await expect.poll(async () => playground.getActiveView()).toBe('week')

    const singleBar = playground.event('single')
    const exclusiveBar = playground.event('exclusive-end')
    const weekLongBar = playground.event('week-long')
    const overlappingBar = playground.event('overlapping')
    const thirdLaneBar = playground.event('third-lane')

    await expect(singleBar).toBeVisible()
    await expect(exclusiveBar).toBeVisible()
    await expect(weekLongBar).toBeVisible()
    await expect(overlappingBar).toBeVisible()
    await expect(thirdLaneBar).toBeVisible()

    const singleBox = await singleBar.boundingBox()
    const exclusiveBox = await exclusiveBar.boundingBox()
    const weekLongBox = await weekLongBar.boundingBox()
    const overlappingBox = await overlappingBar.boundingBox()
    const thirdLaneBox = await thirdLaneBar.boundingBox()

    const weekWidth = weekLongBox!.width + 4
    expect(Math.abs(singleBox!.width + 4 - weekWidth / 7)).toBeLessThan(1)
    expect(
      Math.abs(exclusiveBox!.width + 4 - (weekWidth * 2) / 7)
    ).toBeLessThan(1)
    expect(
      Math.abs(exclusiveBox!.x - weekLongBox!.x - (weekWidth * 2) / 7)
    ).toBeLessThan(1)

    expect(exclusiveBox!.y).not.toBe(overlappingBox!.y)
    expect(exclusiveBox!.y).not.toBe(thirdLaneBox!.y)
    expect(overlappingBox!.y).not.toBe(thirdLaneBox!.y)

    await expect(playground.allDayEvent('promoted')).toBeVisible()

    const staysTimed = playground.eventInDay('2026-03-24', 'stays-timed')
    await expect(staysTimed).toBeVisible()
    await expect(playground.allDayEvent('stays-timed')).toHaveCount(0)
  })

  test('checks recurrence counts, exceptions, moves, and cancellations', async ({
    playground
  }) => {
    await playground.goto()
    await playground.selectPreset('recurrence')
    await expect.poll(async () => playground.getActiveView()).toBe('month')

    await expect(playground.series('counted')).toHaveCount(4)

    await playground.selectView('week')

    await expect(
      playground.eventsByTitle('Weekday check', '2026-03-25')
    ).toHaveCount(0)

    const movedEvent = playground.series('weekdays', '2026-03-27')
    await expect(movedEvent).toBeVisible()
    await expect(movedEvent).toContainText('Weekday check (moved)')
    const movedTitle = await playground
      .eventTitle(movedEvent)
      .getAttribute('title')
    expect(movedTitle).toContain('11:00')

    await expect(
      playground.eventsByTitle('Listed dates', '2026-03-23')
    ).toHaveCount(0)
    await expect(
      playground.eventsByTitle('Listed dates', '2026-03-24')
    ).toBeVisible()
    await expect(
      playground.eventsByTitle('Listed dates', '2026-03-26')
    ).toHaveCount(0)
  })

  test('handles dst disambiguation, boundary error recovery, and 23-hour promotion', async ({
    playground
  }) => {
    await playground.goto()
    await playground.selectPreset('dst')
    await playground.selectView('day')
    await expect.poll(async () => playground.getActiveView()).toBe('day')

    const gapBox = playground.event('inside-the-gap')
    await expect(gapBox).toBeVisible()

    const compatibleTitle = await playground
      .eventTitle(gapBox)
      .getAttribute('title')
    expect(compatibleTitle).toContain('04:30')

    await playground.selectDisambiguation('earlier')
    await expect
      .poll(async () => playground.eventTitle(gapBox).getAttribute('title'))
      .toContain('02:30')

    await playground.selectDisambiguation('reject')
    await expect(playground.alerts).toBeVisible()

    await playground.selectDisambiguation('compatible')
    await expect(playground.alerts).toHaveCount(0)
    await expect(gapBox).toBeVisible()

    await expect(playground.allDayEvent('wall-day')).toBeVisible()
    await expect(playground.eventInDay('2026-03-29', 'wall-day')).toHaveCount(0)
  })
})
