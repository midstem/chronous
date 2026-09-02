import { describe, expect, it } from 'vitest'

import { toIso } from '#src/time'

import { InvalidRangeError, buildRange } from '../index'

const KYIV = 'Europe/Kyiv'
const ANCHOR = '2026-03-18'
const SLOTS_PER_DAY = 24
const DAYS_IN_WEEK = 7
const DAYS_IN_MARCH = 31
const MONDAY_GRID = 42
const SUNDAY_GRID = 35

const base = { currentDate: ANCHOR, timeZone: KYIV } as const

describe('view spans', () => {
  it('builds a single day', () => {
    const range = buildRange({ ...base, view: 'day' })

    expect(range.view).toBe('day')
    expect(range.days).toHaveLength(1)
    expect(toIso(range.days[0].date)).toBe(ANCHOR)
    expect(toIso(range.start)).toBe('2026-03-18T00:00:00+02:00')
    expect(toIso(range.end)).toBe('2026-03-19T00:00:00+02:00')
  })

  it('starts a week on Monday by default', () => {
    const range = buildRange({ ...base, view: 'week' })

    expect(range.days).toHaveLength(DAYS_IN_WEEK)
    expect(toIso(range.days[0].date)).toBe('2026-03-16')
    expect(toIso(range.end)).toBe('2026-03-23T00:00:00+02:00')
  })

  it('honours weekStartsOn', () => {
    const range = buildRange({ ...base, view: 'week', weekStartsOn: 0 })

    expect(toIso(range.days[0].date)).toBe('2026-03-15')
  })

  it('ignores dayCount on fixed views', () => {
    const range = buildRange({ ...base, view: 'week', dayCount: 3 })

    expect(range.days).toHaveLength(DAYS_IN_WEEK)
  })

  it('spans an explicit number of days', () => {
    const range = buildRange({ ...base, view: 'days', dayCount: 3 })

    expect(range.days).toHaveLength(3)
    expect(toIso(range.days[0].date)).toBe(ANCHOR)
    expect(toIso(range.days[2].date)).toBe('2026-03-20')
  })

  it('falls back to a week of days', () => {
    expect(buildRange({ ...base, view: 'days' }).days).toHaveLength(
      DAYS_IN_WEEK
    )
  })

  it('falls back to a month of agenda', () => {
    expect(buildRange({ ...base, view: 'agenda' }).days).toHaveLength(30)
  })
})

describe('month grids', () => {
  it('pads to whole weeks from Monday', () => {
    const range = buildRange({ ...base, view: 'month' })

    expect(range.days).toHaveLength(MONDAY_GRID)
    expect(toIso(range.days[0].date)).toBe('2026-02-23')
    expect(toIso(range.days[MONDAY_GRID - 1].date)).toBe('2026-04-05')
  })

  it('pads to whole weeks from Sunday', () => {
    const range = buildRange({ ...base, view: 'month', weekStartsOn: 0 })

    expect(range.days).toHaveLength(SUNDAY_GRID)
    expect(toIso(range.days[0].date)).toBe('2026-03-01')
  })

  it('marks padding days as outside the period', () => {
    const range = buildRange({ ...base, view: 'month' })
    const inCurrentPeriod = range.days.filter((day) => day.inCurrentPeriod)

    expect(inCurrentPeriod).toHaveLength(DAYS_IN_MARCH)
    expect(toIso(inCurrentPeriod[0].date)).toBe('2026-03-01')
    expect(range.days[0].inCurrentPeriod).toBe(false)
  })
})

describe('slots', () => {
  it.each([
    ['day', SLOTS_PER_DAY],
    ['week', SLOTS_PER_DAY],
    ['days', SLOTS_PER_DAY],
    ['month', 0],
    ['agenda', 0]
  ] as const)('gives %s view %d slots a day', (view, expected) => {
    const range = buildRange({ ...base, view })

    expect(range.days[0].slots).toHaveLength(expected)
  })

  it('tiles the day without gaps', () => {
    const [day] = buildRange({ ...base, view: 'day' }).days

    expect(toIso(day.slots[0].start)).toBe(toIso(day.start))
    expect(toIso(day.slots[SLOTS_PER_DAY - 1].end)).toBe(toIso(day.end))
    expect(day.slots.reduce((total, slot) => total + slot.minutes, 0)).toBe(
      day.minutes
    )
  })

  it('numbers slots by wall minute', () => {
    const [day] = buildRange({ ...base, view: 'day', slotMinutes: 30 }).days

    expect(day.slots).toHaveLength(48)
    expect(day.slots[3].minuteOfDay).toBe(90)
    expect(toIso(day.slots[3].start)).toBe('2026-03-18T01:30:00+02:00')
  })

  it('keeps a trailing partial slot inside the day', () => {
    const [day] = buildRange({ ...base, view: 'day', slotMinutes: 500 }).days

    expect(day.slots).toHaveLength(3)
    expect(day.slots[2].minutes).toBe(440)
    expect(toIso(day.slots[2].end)).toBe(toIso(day.end))
  })
})

describe('rejected ranges', () => {
  it.each([
    ['a slot step of zero', { slotMinutes: 0 }],
    ['a fractional slot step', { slotMinutes: 7.5 }],
    ['a slot step past a day', { slotMinutes: 1441 }]
  ])('rejects %s', (_, overrides) => {
    expect(() => buildRange({ ...base, view: 'day', ...overrides })).toThrow(
      InvalidRangeError
    )
  })

  it.each([
    ['zero days', 0],
    ['a fractional count', 2.5]
  ])('rejects %s', (_, dayCount) => {
    expect(() => buildRange({ ...base, view: 'days', dayCount })).toThrow(
      InvalidRangeError
    )
  })

  it('rejects an unreadable anchor', () => {
    expect(() =>
      buildRange({ view: 'day', currentDate: 'not-a-date', timeZone: KYIV })
    ).toThrow(InvalidRangeError)
  })

  it('rejects an unreadable time zone', () => {
    expect(() =>
      buildRange({ view: 'day', currentDate: ANCHOR, timeZone: 'Not/AZone' })
    ).toThrow(InvalidRangeError)
  })

  it('names the time zone and keeps what Temporal threw', () => {
    try {
      buildRange({ view: 'day', currentDate: ANCHOR, timeZone: 'Not/AZone' })
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidRangeError)
      expect((error as InvalidRangeError).reason).toContain('time zone')
      expect((error as InvalidRangeError).cause).toBeInstanceOf(Error)
    }
  })

  it('reads a zone whose name is spelled in another case', () => {
    expect(() =>
      buildRange({ view: 'day', currentDate: ANCHOR, timeZone: 'europe/kyiv' })
    ).not.toThrow()
  })

  it('carries the reason', () => {
    try {
      buildRange({ ...base, view: 'day', slotMinutes: 0 })
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidRangeError)
      expect((error as InvalidRangeError).reason).toContain('slotMinutes')
      expect((error as InvalidRangeError).name).toBe('InvalidRangeError')
    }
  })
})
