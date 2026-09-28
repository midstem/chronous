import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { InvalidEventError } from '#src/event'
import type { EventInput } from '#src/event'
import { InvalidRangeError } from '#src/range'
import type { CalendarRange } from '#src/range'
import { InvalidRecurrenceError } from '#src/recurrence'
import { MissingTemporalError } from '#src/time'

import { resetFallbackWarning } from '../date-fallback'
import { buildCalendar } from '../index'

const KYIV = 'Europe/Kyiv'
const NEW_YORK = 'America/New_York'
const TOKYO = 'Asia/Tokyo'
const ANCHOR = '2026-03-18'
const WEDNESDAY_INDEX = 2
const THURSDAY_INDEX = 3

const baseWeekRange: CalendarRange = {
  view: 'week',
  currentDate: ANCHOR,
  timeZone: KYIV,
  timeFallback: 'date'
}

describe('Date fallback activation & invariants', () => {
  beforeEach(() => {
    resetFallbackWarning()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('throws MissingTemporalError when Temporal is missing and fallback is not selected', () => {
    vi.stubGlobal('Temporal', undefined)

    const range: CalendarRange = {
      view: 'week',
      currentDate: ANCHOR,
      timeZone: KYIV
    }

    expect(() => buildCalendar(range, [])).toThrow(MissingTemporalError)
  })

  it('activates fallback when Temporal is missing and range.timeFallback is "date"', () => {
    vi.stubGlobal('Temporal', undefined)

    const calendar = buildCalendar(baseWeekRange, [])
    expect(calendar.view).toBe('week')
    expect(calendar.days).toHaveLength(7)
  })

  it('preserves existing Temporal path when Temporal is present even if timeFallback is "date"', () => {
    const warnSpy = vi.spyOn(console, 'warn')
    const calendar = buildCalendar(baseWeekRange, [])

    expect(calendar.view).toBe('week')
    // Fallback console.warn should not be called when Temporal is present
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('logs a one-time console.warn when fallback executes for the first time', () => {
    vi.stubGlobal('Temporal', undefined)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    buildCalendar(baseWeekRange, [])
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0][0]).toContain(
      '[@midstem/chronous] Date fallback is active'
    )

    // Second execution in fallback mode should not warn again
    buildCalendar(baseWeekRange, [])
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })
})

describe('Scenario: Fixed instant in Europe/Kyiv on an ordinary day', () => {
  beforeEach(() => {
    resetFallbackWarning()
    vi.stubGlobal('Temporal', undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('includes event at the correct local hour', () => {
    // 2026-03-18 in Europe/Kyiv is UTC+2
    // 07:00 UTC = 09:00 Kyiv, 08:30 UTC = 10:30 Kyiv
    const events: EventInput[] = [
      {
        id: 'meeting',
        start: '2026-03-18T07:00:00Z',
        end: '2026-03-18T08:30:00Z'
      }
    ]

    const calendar = buildCalendar(baseWeekRange, events)
    const [box] = calendar.days[WEDNESDAY_INDEX].boxes

    expect(box).toBeDefined()
    expect(box.start).toBe('2026-03-18T09:00:00+02:00')
    expect(box.end).toBe('2026-03-18T10:30:00+02:00')
    expect(box.startMinute).toBe(540) // 9 * 60
    expect(box.endMinute).toBe(630) // 10.5 * 60
    expect(box.minutes).toBe(90)
    expect(box.top).toBe(540 / 1440)
    expect(box.height).toBe(90 / 1440)
    expect(box.column).toBe(0)
    expect(box.columns).toBe(1)
    expect(box.span).toBe(1)
    expect(box.continuesBefore).toBe(false)
    expect(box.continuesAfter).toBe(false)
    expect(box.event).toEqual({
      id: 'meeting',
      allDay: false,
      start: '2026-03-18T09:00:00+02:00',
      end: '2026-03-18T10:30:00+02:00',
      seriesId: undefined,
      recurrenceId: undefined,
      data: undefined
    })
  })

  it('handles explicit numeric offset', () => {
    const events: EventInput[] = [
      {
        id: 'meeting',
        start: '2026-03-18T09:00:00+02:00',
        end: '2026-03-18T10:30:00+02:00'
      }
    ]

    const calendar = buildCalendar(baseWeekRange, events)
    const [box] = calendar.days[WEDNESDAY_INDEX].boxes

    expect(box.start).toBe('2026-03-18T09:00:00+02:00')
    expect(box.end).toBe('2026-03-18T10:30:00+02:00')
    expect(box.startMinute).toBe(540)
    expect(box.endMinute).toBe(630)
  })

  it('splits timed events crossing midnight into two boxes', () => {
    // 20:00 UTC = 22:00 Kyiv, 00:00 UTC = 02:00 Kyiv next day
    const events: EventInput[] = [
      {
        id: 'cross',
        start: '2026-03-18T20:00:00Z',
        end: '2026-03-19T00:00:00Z'
      }
    ]

    const calendar = buildCalendar(baseWeekRange, events)
    const wedBox = calendar.days[WEDNESDAY_INDEX].boxes[0]
    const thuBox = calendar.days[THURSDAY_INDEX].boxes[0]

    expect(wedBox).toMatchObject({
      start: '2026-03-18T22:00:00+02:00',
      end: '2026-03-19T00:00:00+02:00',
      startMinute: 1320,
      endMinute: 1440,
      continuesBefore: false,
      continuesAfter: true
    })
    expect(thuBox).toMatchObject({
      start: '2026-03-19T00:00:00+02:00',
      end: '2026-03-19T02:00:00+02:00',
      startMinute: 0,
      endMinute: 120,
      continuesBefore: true,
      continuesAfter: false
    })
  })
})

describe('Scenario: Date-only all-day event unchanged across viewer zones', () => {
  beforeEach(() => {
    resetFallbackWarning()
    vi.stubGlobal('Temporal', undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('keeps date unchanged regardless of viewer zone', () => {
    const events: EventInput[] = [
      { id: 'allday', start: '2026-03-18', end: '2026-03-20' }
    ]

    const kyivCal = buildCalendar({ ...baseWeekRange, timeZone: KYIV }, events)
    const nyCal = buildCalendar(
      { ...baseWeekRange, timeZone: NEW_YORK },
      events
    )
    const tokyoCal = buildCalendar(
      { ...baseWeekRange, timeZone: TOKYO },
      events
    )

    expect(kyivCal.rows[0].bars[0].event).toMatchObject({
      allDay: true,
      start: '2026-03-18',
      end: '2026-03-20'
    })
    expect(nyCal.rows[0].bars[0].event).toMatchObject({
      allDay: true,
      start: '2026-03-18',
      end: '2026-03-20'
    })
    expect(tokyoCal.rows[0].bars[0].event).toMatchObject({
      allDay: true,
      start: '2026-03-18',
      end: '2026-03-20'
    })
  })

  it('infers single day all-day event when end is omitted', () => {
    const calendar = buildCalendar(baseWeekRange, [
      { id: 'single', start: '2026-03-18' }
    ])

    const bar = calendar.rows[0].bars[0]
    expect(bar.event).toMatchObject({
      allDay: true,
      start: '2026-03-18',
      end: '2026-03-19'
    })
    expect(bar.dayCount).toBe(1)
  })
})

describe('Scenario: Rejection of unsupported inputs with typed errors', () => {
  beforeEach(() => {
    resetFallbackWarning()
    vi.stubGlobal('Temporal', undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('raises InvalidRecurrenceError on recurrence', () => {
    const events: EventInput[] = [
      {
        id: 'series',
        start: '2026-03-18T07:00:00Z',
        recurrence: { rule: 'FREQ=DAILY' }
      }
    ]

    expect(() => buildCalendar(baseWeekRange, events)).toThrow(
      InvalidRecurrenceError
    )
  })

  it('raises InvalidEventError on floating time (no Z or numeric offset)', () => {
    const events: EventInput[] = [
      { id: 'floating', start: '2026-03-18T09:00:00' }
    ]

    expect(() => buildCalendar(baseWeekRange, events)).toThrow(
      InvalidEventError
    )
  })

  it('raises InvalidEventError on source-zone-only timed value without offset', () => {
    const events: EventInput[] = [
      {
        id: 'source-zone-only',
        start: '2026-03-18T09:00:00',
        timeZone: KYIV
      }
    ]

    expect(() => buildCalendar(baseWeekRange, events)).toThrow(
      InvalidEventError
    )
  })

  it('raises InvalidEventError on duration', () => {
    const events: EventInput[] = [
      {
        id: 'has-duration',
        start: '2026-03-18T07:00:00Z',
        duration: 'PT1H'
      }
    ]

    expect(() => buildCalendar(baseWeekRange, events)).toThrow(
      InvalidEventError
    )
  })

  it('raises InvalidRangeError on DST transition day', () => {
    // 2026-03-29 is Europe/Kyiv spring transition day (23-hour day)
    const range: CalendarRange = {
      view: 'day',
      currentDate: '2026-03-29',
      timeZone: KYIV,
      timeFallback: 'date'
    }

    expect(() => buildCalendar(range, [])).toThrow(InvalidRangeError)
  })

  it('raises InvalidRangeError when week covers a DST transition day', () => {
    // Week containing 2026-03-29 in Europe/Kyiv
    const range: CalendarRange = {
      view: 'week',
      currentDate: '2026-03-25',
      timeZone: KYIV,
      timeFallback: 'date'
    }

    expect(() => buildCalendar(range, [])).toThrow(InvalidRangeError)
  })

  it('raises InvalidEventError on end-before-start', () => {
    expect(() =>
      buildCalendar(baseWeekRange, [
        {
          id: 'bad-timed',
          start: '2026-03-18T10:00:00Z',
          end: '2026-03-18T09:00:00Z'
        }
      ])
    ).toThrow(InvalidEventError)

    expect(() =>
      buildCalendar(baseWeekRange, [
        { id: 'bad-allday', start: '2026-03-18', end: '2026-03-17' }
      ])
    ).toThrow(InvalidEventError)
  })

  it('raises InvalidEventError on invalid ID', () => {
    expect(() =>
      buildCalendar(baseWeekRange, [{ id: '', start: '2026-03-18' }])
    ).toThrow(InvalidEventError)
  })

  it('raises InvalidRangeError on unreadable timeZone', () => {
    expect(() =>
      buildCalendar({ ...baseWeekRange, timeZone: 'Invalid/Zone' }, [])
    ).toThrow(InvalidRangeError)
  })

  it('raises InvalidRangeError on unreadable currentDate', () => {
    expect(() =>
      buildCalendar({ ...baseWeekRange, currentDate: 'yesterday' }, [])
    ).toThrow(InvalidRangeError)
  })

  it('names the zone before reading any event', () => {
    expect(() =>
      buildCalendar({ ...baseWeekRange, timeZone: 'Invalid/Zone' }, [
        { id: 'broken', start: 'yesterday' }
      ])
    ).toThrow(InvalidRangeError)
  })
})

describe('View support in date fallback', () => {
  beforeEach(() => {
    resetFallbackWarning()
    vi.stubGlobal('Temporal', undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('supports "day" view', () => {
    const calendar = buildCalendar({ ...baseWeekRange, view: 'day' }, [])
    expect(calendar.view).toBe('day')
    expect(calendar.days).toHaveLength(1)
    expect(calendar.days[0].slots).toHaveLength(24)
    expect(calendar.rows).toHaveLength(1)
  })

  it('supports "week" view', () => {
    const calendar = buildCalendar(baseWeekRange, [])
    expect(calendar.view).toBe('week')
    expect(calendar.days).toHaveLength(7)
    expect(calendar.days[0].slots).toHaveLength(24)
    expect(calendar.rows).toHaveLength(1)
  })

  it('supports "days" view with dayCount', () => {
    const calendar = buildCalendar(
      { ...baseWeekRange, view: 'days', dayCount: 3 },
      []
    )
    expect(calendar.view).toBe('days')
    expect(calendar.days).toHaveLength(3)
    expect(calendar.days[0].slots).toHaveLength(24)
    expect(calendar.rows).toHaveLength(1)
  })

  it('supports "agenda" view with empty slots', () => {
    const calendar = buildCalendar(
      { ...baseWeekRange, view: 'agenda', dayCount: 5 },
      []
    )
    expect(calendar.view).toBe('agenda')
    expect(calendar.days).toHaveLength(5)
    expect(calendar.days.every((d) => d.slots.length === 0)).toBe(true)
    expect(calendar.rows).toHaveLength(1)
  })

  it('supports "month" view with padded weeks and 6 rows', () => {
    // May 2026 has no Kyiv offset transition in its padded grid.
    const calendar = buildCalendar(
      { ...baseWeekRange, view: 'month', currentDate: '2026-05-18' },
      []
    )
    expect(calendar.view).toBe('month')
    expect(calendar.days.length % 7).toBe(0)
    expect(calendar.days.every((d) => d.slots.length === 0)).toBe(true)
    expect(calendar.rows).toHaveLength(calendar.days.length / 7)
    expect(calendar.days[0]).toMatchObject({
      date: '2026-04-27',
      inCurrentPeriod: false
    })
    expect(calendar.days[4]).toMatchObject({
      date: '2026-05-01',
      inCurrentPeriod: true
    })
  })
})

describe('Equivalence between Temporal engine and Date fallback on allowed inputs', () => {
  beforeEach(() => {
    resetFallbackWarning()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('produces identical calendar layout for allowed events', () => {
    const events: EventInput<{ tag: string }>[] = [
      {
        id: 'meeting',
        start: '2026-03-18T07:00:00Z',
        end: '2026-03-18T08:30:00Z',
        data: { tag: 'standup' }
      },
      {
        id: 'holiday',
        start: '2026-03-16',
        end: '2026-03-18',
        data: { tag: 'offsite' }
      },
      {
        id: 'late',
        start: '2026-03-18T20:00:00Z',
        end: '2026-03-19T00:00:00Z'
      }
    ]

    // 1. Run with normal Temporal engine
    const temporalLayout = buildCalendar(
      { view: 'week', currentDate: ANCHOR, timeZone: KYIV },
      events
    )

    // 2. Run with Date fallback
    vi.stubGlobal('Temporal', undefined)
    const fallbackLayout = buildCalendar(
      { ...baseWeekRange, view: 'week' },
      events
    )

    expect(fallbackLayout.view).toEqual(temporalLayout.view)
    expect(fallbackLayout.start).toEqual(temporalLayout.start)
    expect(fallbackLayout.end).toEqual(temporalLayout.end)
    expect(fallbackLayout.days).toEqual(temporalLayout.days)
    expect(fallbackLayout.rows).toEqual(temporalLayout.rows)
  })

  it('matches overlapping boxes and multi-day bars in a transition-free month', () => {
    const events: EventInput[] = [
      {
        id: 'first',
        start: '2026-05-18T07:00:00Z',
        end: '2026-05-18T09:00:00Z'
      },
      {
        id: 'second',
        start: '2026-05-18T08:00:00Z',
        end: '2026-05-18T10:00:00Z'
      },
      { id: 'instant', start: '2026-05-18T11:00:00Z' },
      {
        id: 'long',
        start: '2026-05-19T20:00:00Z',
        end: '2026-05-21T00:00:00Z'
      },
      { id: 'all-day', start: '2026-05-20', end: '2026-05-23' }
    ]
    const range: CalendarRange = {
      view: 'month',
      currentDate: '2026-05-18',
      timeZone: KYIV
    }
    const expected = buildCalendar(range, events)

    vi.stubGlobal('Temporal', undefined)
    const actual = buildCalendar({ ...range, timeFallback: 'date' }, events)

    expect(actual).toEqual(expected)
  })
})
