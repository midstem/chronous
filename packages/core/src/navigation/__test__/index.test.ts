import { describe, expect, it } from 'vitest'

import { InvalidRangeError, buildRange } from '#src/range'
import type { CalendarRange, ViewKind } from '#src/range'
import { toIso } from '#src/time'

import { calendarReducer, initialCalendarState } from '../index'
import type { CalendarSelection, CalendarState } from '../types'

const TIME_ZONE = 'Europe/Kyiv'

const ANCHOR = '2026-08-25'

const ISO_DATE_LENGTH = 10

const rangeOf = (patch: Partial<CalendarRange> = {}): CalendarRange => ({
  view: 'week',
  currentDate: ANCHOR,
  timeZone: TIME_ZONE,
  ...patch
})

const stateOf = (patch: Partial<CalendarRange> = {}): CalendarState =>
  initialCalendarState(rangeOf(patch))

const STEPS: [ViewKind, Partial<CalendarRange>, string, string][] = [
  ['day', {}, '2026-08-26', '2026-08-24'],
  ['week', {}, '2026-09-01', '2026-08-18'],
  ['days', {}, '2026-09-01', '2026-08-18'],
  ['days', { dayCount: 3 }, '2026-08-28', '2026-08-22'],
  ['agenda', {}, '2026-09-24', '2026-07-26'],
  ['agenda', { dayCount: 10 }, '2026-09-04', '2026-08-15'],
  ['month', {}, '2026-09-01', '2026-07-01']
]

describe('the reducer steps a period at a time', () => {
  it.each(STEPS)(
    '%s moves forward to %s and back to %s',
    (view, patch, forward, backward) => {
      const state = stateOf({ view, ...patch })

      expect(calendarReducer(state, { type: 'next' }).range.currentDate).toBe(
        forward
      )
      expect(calendarReducer(state, { type: 'prev' }).range.currentDate).toBe(
        backward
      )
    }
  )

  it('anchors a month on the first, so short months do not drag it back', () => {
    const january = stateOf({ view: 'month', currentDate: '2026-01-31' })
    const february = calendarReducer(january, { type: 'next' })
    const march = calendarReducer(february, { type: 'next' })

    expect(february.range.currentDate).toBe('2026-02-01')
    expect(march.range.currentDate).toBe('2026-03-01')
  })

  it('steps over a DST transition without losing a day', () => {
    const state = stateOf({ view: 'day', currentDate: '2026-03-28' })
    const across = calendarReducer(state, { type: 'next' })

    expect(across.range.currentDate).toBe('2026-03-29')
    expect(calendarReducer(across, { type: 'next' }).range.currentDate).toBe(
      '2026-03-30'
    )
  })
})

const CONTIGUOUS: [ViewKind, Partial<CalendarRange>][] = [
  ['day', {}],
  ['week', {}],
  ['days', {}],
  ['days', { dayCount: 3 }],
  ['agenda', { dayCount: 10 }],
  ['month', {}]
]

const dayAfter = (date: string): string => {
  const moment = new Date(`${date}T00:00:00Z`)

  moment.setUTCDate(moment.getUTCDate() + 1)

  return moment.toISOString().slice(0, ISO_DATE_LENGTH)
}

const isRun = (dates: readonly string[]): boolean =>
  dates.every(
    (date, index) => index === 0 || dayAfter(dates[index - 1]) === date
  )

const periodDates = (range: CalendarRange): string[] =>
  buildRange(range)
    .days.filter((day) => day.inCurrentPeriod)
    .map((day) => toIso(day.date))

describe('the step agrees with the range it will build', () => {
  it.each(CONTIGUOUS)(
    '%s leaves no gap and no overlap going forward',
    (view, patch) => {
      const state = stateOf({ view, ...patch })
      const here = periodDates(state.range)
      const there = periodDates(calendarReducer(state, { type: 'next' }).range)

      expect(isRun(here)).toBe(true)
      expect(isRun(there)).toBe(true)
      expect(isRun([...here, ...there])).toBe(true)
    }
  )

  it.each(CONTIGUOUS)('%s returns to where it started', (view, patch) => {
    const state = stateOf({ view, ...patch })
    const there = calendarReducer(state, { type: 'next' })

    expect(periodDates(calendarReducer(there, { type: 'prev' }).range)).toEqual(
      periodDates(state.range)
    )
  })
})

const TODAY_READINGS: [string, string, string][] = [
  ['Europe/Kyiv', '2026-08-25T23:30:00Z', '2026-08-26'],
  ['America/Santiago', '2026-08-25T23:30:00Z', '2026-08-25'],
  ['Asia/Kolkata', '2026-08-25T18:45:00Z', '2026-08-26'],
  ['Australia/Lord_Howe', '2026-08-25T13:30:00Z', '2026-08-26'],
  ['UTC', '2026-08-25T00:00:00Z', '2026-08-25']
]

describe('today reads the given moment in the range time zone', () => {
  it.each(TODAY_READINGS)('%s at %s is %s', (timeZone, now, date) => {
    const state = stateOf({ timeZone })

    expect(
      calendarReducer(state, { type: 'today', now }).range.currentDate
    ).toBe(date)
  })

  it('takes a wall-clock string as local to the range time zone', () => {
    const state = stateOf({ timeZone: 'Asia/Kolkata' })
    const moved = calendarReducer(state, {
      type: 'today',
      now: '2026-08-26T00:30:00'
    })

    expect(moved.range.currentDate).toBe('2026-08-26')
  })
})

describe('the reducer moves the view, the date and the selection', () => {
  it('goes to a date without touching the rest of the range', () => {
    const state = stateOf({ dayCount: 3, slotMinutes: 15 })
    const moved = calendarReducer(state, { type: 'goto', date: '2027-01-04' })

    expect(moved.range).toEqual({ ...state.range, currentDate: '2027-01-04' })
    expect(moved.selection).toBeNull()
  })

  it('changes the view and keeps the anchor', () => {
    const moved = calendarReducer(stateOf(), { type: 'view', view: 'month' })

    expect(moved.range.view).toBe('month')
    expect(moved.range.currentDate).toBe(ANCHOR)
  })

  const SELECTIONS: CalendarSelection[] = [
    { kind: 'event', id: 'standup' },
    { kind: 'slot', date: ANCHOR, minuteOfDay: 540 },
    { kind: 'date', date: ANCHOR }
  ]

  it.each(SELECTIONS)('holds the %o selection and clears it', (selection) => {
    const held = calendarReducer(stateOf(), { type: 'select', selection })

    expect(held.selection).toEqual(selection)
    expect(calendarReducer(held, { type: 'clear' }).selection).toBeNull()
  })

  it('carries the selection across a move', () => {
    const held = calendarReducer(stateOf(), {
      type: 'select',
      selection: { kind: 'event', id: 'standup' }
    })

    expect(calendarReducer(held, { type: 'next' }).selection).toEqual(
      held.selection
    )
  })
})

describe('the reducer hands back the same state when nothing moves', () => {
  it('keeps the state on a goto to the date already held', () => {
    const state = stateOf()

    expect(calendarReducer(state, { type: 'goto', date: ANCHOR })).toBe(state)
  })

  it('keeps the state on a view already shown', () => {
    const state = stateOf()

    expect(calendarReducer(state, { type: 'view', view: 'week' })).toBe(state)
  })

  it('keeps the state on a clear with nothing selected', () => {
    const state = stateOf()

    expect(calendarReducer(state, { type: 'clear' })).toBe(state)
  })
})

describe('the reducer refuses what the range would refuse', () => {
  it('reports an unreadable anchor', () => {
    const state = stateOf({ currentDate: 'the day after tomorrow' })

    expect(() => calendarReducer(state, { type: 'next' })).toThrow(
      InvalidRangeError
    )
  })

  it('reports a day count that is not a whole number of days', () => {
    const state = stateOf({ view: 'days', dayCount: 2.5 })

    expect(() => calendarReducer(state, { type: 'prev' })).toThrow(
      InvalidRangeError
    )
  })

  it('reports an unreadable moment', () => {
    expect(() =>
      calendarReducer(stateOf(), { type: 'today', now: 'right now' })
    ).toThrow(InvalidRangeError)
  })

  it('reports an unreadable time zone', () => {
    const state = stateOf({ timeZone: 'Mars/Olympus_Mons' })

    expect(() =>
      calendarReducer(state, { type: 'today', now: '2026-08-25T10:00:00Z' })
    ).toThrow(InvalidRangeError)
  })
})
