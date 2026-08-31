import { describe, expect, it } from 'vitest'

import {
  add,
  formatIso,
  hoursInDay,
  minutesBetween,
  startOfWeek,
  toIso,
  withTimeZone,
  zoned
} from '../index'
import type { DateTimeFormatOptions } from '../types'

const MINUTES_IN_HOUR = 60

describe('day length across DST transitions', () => {
  it.each([
    ['Europe/Kyiv', '2026-03-29', 23],
    ['Europe/Kyiv', '2026-10-25', 25],
    ['America/New_York', '2026-03-08', 23],
    ['America/New_York', '2026-11-01', 25],
    ['Australia/Lord_Howe', '2026-10-04', 23.5],
    ['Australia/Lord_Howe', '2026-04-05', 24.5],
    ['Asia/Kolkata', '2026-03-29', 24]
  ])('%s has %d hours on %s', (timeZone, date, hours) => {
    expect(hoursInDay(zoned(date, timeZone))).toBe(hours)
  })
})

describe('wall times inside a spring-forward gap', () => {
  const GAP = '2026-03-29T03:30:00'

  it('moves forward by default', () => {
    expect(toIso(zoned(GAP, 'Europe/Kyiv'))).toBe('2026-03-29T04:30:00+03:00')
  })

  it('honours an earlier disambiguation', () => {
    expect(toIso(zoned(GAP, 'Europe/Kyiv', 'earlier'))).toBe(
      '2026-03-29T02:30:00+02:00'
    )
  })

  it('honours a later disambiguation', () => {
    expect(toIso(zoned(GAP, 'Europe/Kyiv', 'later'))).toBe(
      '2026-03-29T04:30:00+03:00'
    )
  })

  it('rejects when asked to', () => {
    expect(() => zoned(GAP, 'Europe/Kyiv', 'reject')).toThrow(RangeError)
  })
})

describe('wall times that happen twice on fall back', () => {
  const AMBIGUOUS = '2026-10-25T03:30:00'

  it('picks the first occurrence by default', () => {
    expect(toIso(zoned(AMBIGUOUS, 'Europe/Kyiv'))).toBe(
      '2026-10-25T03:30:00+03:00'
    )
  })

  it('picks the second occurrence when asked', () => {
    expect(toIso(zoned(AMBIGUOUS, 'Europe/Kyiv', 'later'))).toBe(
      '2026-10-25T03:30:00+02:00'
    )
  })

  it('separates the two occurrences by an hour', () => {
    const first = zoned(AMBIGUOUS, 'Europe/Kyiv', 'earlier')
    const second = zoned(AMBIGUOUS, 'Europe/Kyiv', 'later')

    expect(minutesBetween(first, second)).toBe(MINUTES_IN_HOUR)
  })
})

describe('calendar arithmetic versus exact arithmetic', () => {
  const BEFORE_FALL_BACK = zoned('2026-10-24T09:00:00', 'Europe/Kyiv')

  it('keeps the wall clock when adding a day', () => {
    expect(toIso(add(BEFORE_FALL_BACK, { days: 1 }))).toBe(
      '2026-10-25T09:00:00+02:00'
    )
  })

  it('shifts the wall clock when adding twenty four hours', () => {
    expect(toIso(add(BEFORE_FALL_BACK, { hours: 24 }))).toBe(
      '2026-10-25T08:00:00+02:00'
    )
  })

  it('keeps a weekly series on the same wall clock', () => {
    const tuesdayBefore = zoned('2026-10-20T09:00:00', 'Europe/Kyiv')

    expect(toIso(add(tuesdayBefore, { weeks: 1 }))).toBe(
      '2026-10-27T09:00:00+02:00'
    )
  })

  it('counts the real minutes in a twenty five hour day', () => {
    const dayStart = zoned('2026-10-25', 'Europe/Kyiv')
    const nextDayStart = zoned('2026-10-26', 'Europe/Kyiv')

    expect(minutesBetween(dayStart, nextDayStart)).toBe(25 * MINUTES_IN_HOUR)
  })
})

describe('days whose midnight does not exist', () => {
  it('starts the Havana spring-forward day at one in the morning', () => {
    expect(toIso(zoned('2026-03-08', 'America/Havana'))).toBe(
      '2026-03-08T01:00:00-04:00'
    )
  })
})

describe('week starts around a transition', () => {
  const SUNDAY_AFTERNOON = zoned('2026-10-28T15:00:00', 'Europe/Kyiv')

  it('anchors a Monday week after the transition', () => {
    expect(toIso(startOfWeek(SUNDAY_AFTERNOON, 1))).toBe(
      '2026-10-26T00:00:00+02:00'
    )
  })

  it('anchors a Sunday week before the transition', () => {
    expect(toIso(startOfWeek(SUNDAY_AFTERNOON, 0))).toBe(
      '2026-10-25T00:00:00+03:00'
    )
  })
})

describe('rendering the same instant in another zone', () => {
  it('keeps the instant while changing the wall clock', () => {
    const kyiv = zoned('2026-10-25T03:30:00', 'Europe/Kyiv')

    expect(toIso(withTimeZone(kyiv, 'America/New_York'))).toBe(
      '2026-10-24T20:30:00-04:00'
    )
  })

  it('supports zones with a half hour offset', () => {
    expect(toIso(zoned('2026-03-15T09:00:00', 'Asia/Kolkata'))).toBe(
      '2026-03-15T09:00:00+05:30'
    )
  })
})

describe('labels across DST transitions', () => {
  const CLOCK: DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZoneName: 'short'
  }
  const DAY: DateTimeFormatOptions = { day: 'numeric', month: 'long' }

  it.each([
    ['2026-10-25T03:00:00+03:00', '03:00 GMT+3'],
    ['2026-10-25T03:00:00+02:00', '03:00 GMT+2']
  ])('tells the two Kyiv %s apart by its offset', (iso, expected) => {
    expect(formatIso(iso, { locale: 'en-GB', options: CLOCK })).toBe(expected)
  })

  it.each([
    ['2026-03-29T02:00:00+02:00', '02:00 GMT+2'],
    ['2026-03-29T04:00:00+03:00', '04:00 GMT+3']
  ])('labels %s around the Kyiv skipped hour', (iso, expected) => {
    expect(formatIso(iso, { locale: 'en-GB', options: CLOCK })).toBe(expected)
  })

  it.each([
    ['2026-10-04T01:30:00+10:30', '01:30 GMT+10:30'],
    ['2026-10-04T02:30:00+11:00', '02:30 GMT+11'],
    ['2026-09-06T01:00:00-03:00', '01:00 GMT-3'],
    ['2026-03-15T09:00:00+05:30', '09:00 GMT+5:30']
  ])('labels %s in the offset it carries', (iso, expected) => {
    expect(formatIso(iso, { locale: 'en-GB', options: CLOCK })).toBe(expected)
  })

  it('keeps the day of a Santiago date whose midnight does not exist', () => {
    expect(formatIso('2026-09-06', { locale: 'en-GB', options: DAY })).toBe(
      '6 September'
    )
  })

  it('keeps the day of a date west of Greenwich in an eastern zone', () => {
    expect(
      formatIso('2026-09-06', {
        locale: 'en-GB',
        timeZone: 'Australia/Lord_Howe',
        options: DAY
      })
    ).toBe('6 September')
  })

  it('labels the repeated Kyiv hour in a locale that needs full ICU', () => {
    expect(
      formatIso('2026-10-25T03:00:00+02:00', {
        locale: 'uk-UA',
        options: DAY
      })
    ).toBe('25 жовтня')
  })
})
