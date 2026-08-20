import { afterEach, describe, expect, it, vi } from 'vitest'

import { MISSING_TEMPORAL_MESSAGE } from '../constants'
import {
  add,
  compare,
  duration,
  format,
  now,
  plainDate,
  startOfDay,
  startOfWeek,
  subtract,
  timeZoneOf,
  toIso,
  withTimeZone,
  zoned
} from '../index'
import type { FormatOptions, Moment, WeekStartsOn } from '../types'

const KYIV = 'Europe/Kyiv'
const NEW_YORK = 'America/New_York'
const CLOCK_OPTIONS: FormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}
const DATE_OPTIONS: FormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('zoned', () => {
  it.each([
    ['2026-05-10', '2026-05-10T00:00:00+03:00'],
    ['2026-05-10T14:30:00', '2026-05-10T14:30:00+03:00'],
    ['2026-05-10T14:30', '2026-05-10T14:30:00+03:00'],
    ['2026-05-10T11:30:00Z', '2026-05-10T14:30:00+03:00'],
    ['2026-05-10T09:30:00-02:00', '2026-05-10T14:30:00+03:00'],
    [
      '2026-05-10T07:30:00-04:00[America/New_York]',
      '2026-05-10T14:30:00+03:00'
    ],
    ['2026-05-10T07:30:00[America/New_York]', '2026-05-10T14:30:00+03:00']
  ])('reads %s as %s in Kyiv', (input, expected) => {
    expect(toIso(zoned(input, KYIV))).toBe(expected)
  })

  it('fails with a readable message when Temporal is missing', () => {
    vi.stubGlobal('Temporal', undefined)

    expect(() => zoned('2026-05-10', KYIV)).toThrow(MISSING_TEMPORAL_MESSAGE)
  })
})

describe('plainDate', () => {
  it('keeps a bare date free of any zone', () => {
    expect(toIso(plainDate('2026-03-15'))).toBe('2026-03-15')
  })

  it('shifts by calendar days only', () => {
    expect(toIso(add(plainDate('2026-03-15'), { days: 20 }))).toBe('2026-04-04')
  })

  it('truncates clock units to whole days', () => {
    expect(toIso(add(plainDate('2026-03-15'), { hours: 1 }))).toBe('2026-03-15')
    expect(toIso(add(plainDate('2026-03-15'), { hours: 25 }))).toBe(
      '2026-03-16'
    )
  })
})

describe('add and subtract', () => {
  it('round trips a moment', () => {
    const start = zoned('2026-05-10T14:30:00', KYIV)

    expect(toIso(subtract(add(start, { months: 2 }), { months: 2 }))).toBe(
      toIso(start)
    )
  })

  it('round trips a calendar date', () => {
    const start = plainDate('2026-01-31')

    expect(toIso(subtract(add(start, { months: 1 }), { months: 1 }))).toBe(
      '2026-01-28'
    )
  })

  it('accepts a duration instance', () => {
    const start = zoned('2026-05-10T14:30:00', KYIV)

    expect(toIso(add(start, duration('PT90M')))).toBe(
      '2026-05-10T16:00:00+03:00'
    )
  })
})

describe('compare', () => {
  it('orders moments regardless of the zone they are rendered in', () => {
    const kyiv = zoned('2026-05-10T14:30:00', KYIV)
    const sameInstant = withTimeZone(kyiv, NEW_YORK)
    const later = add(kyiv, { minutes: 1 })

    expect(compare(kyiv, sameInstant)).toBe(0)
    expect(compare(kyiv, later)).toBe(-1)
    expect(compare(later, kyiv)).toBe(1)
  })

  it('orders calendar dates', () => {
    expect(compare(plainDate('2026-03-15'), plainDate('2026-03-16'))).toBe(-1)
    expect(compare(plainDate('2026-03-15'), plainDate('2026-03-15'))).toBe(0)
  })
})

describe('startOfDay and startOfWeek', () => {
  it('drops the time of day', () => {
    expect(toIso(startOfDay(zoned('2026-05-10T14:30:00', KYIV)))).toBe(
      '2026-05-10T00:00:00+03:00'
    )
  })

  it.each([
    [0, '2026-05-10'],
    [1, '2026-05-11'],
    [2, '2026-05-12'],
    [3, '2026-05-13'],
    [4, '2026-05-07'],
    [5, '2026-05-08'],
    [6, '2026-05-09']
  ])('anchors a week starting on day %i at %s', (weekStartsOn, expected) => {
    const wednesday = zoned('2026-05-13T14:30:00', KYIV)

    expect(toIso(startOfWeek(wednesday, weekStartsOn as WeekStartsOn))).toBe(
      `${expected}T00:00:00+03:00`
    )
  })
})

describe('duration', () => {
  it('parses an ISO duration', () => {
    expect(duration('PT1H30M').total({ unit: 'minute' })).toBe(90)
  })

  it('accepts a plain object', () => {
    expect(duration({ hours: 1, minutes: 30 }).total({ unit: 'minute' })).toBe(
      90
    )
  })
})

describe('format', () => {
  const moment = zoned('2026-05-10T14:30:00', KYIV)

  it('renders a moment in its own zone', () => {
    expect(format(moment, { locale: 'en-GB', options: CLOCK_OPTIONS })).toBe(
      '14:30'
    )
  })

  it('renders the same moment in another zone', () => {
    expect(
      format(moment, {
        locale: 'en-GB',
        timeZone: NEW_YORK,
        options: CLOCK_OPTIONS
      })
    ).toBe('07:30')
  })

  it('renders a calendar date without drifting across the date line', () => {
    expect(
      format(plainDate('2026-03-15'), {
        locale: 'en-CA',
        options: DATE_OPTIONS
      })
    ).toBe('2026-03-15')
  })

  it('respects the locale', () => {
    expect(
      format(moment, { locale: 'uk-UA', options: { month: 'long' } })
    ).toBe('травень')
  })

  it('reuses a formatter for a repeated request', () => {
    const spec = { locale: 'en-GB', options: CLOCK_OPTIONS }

    expect(format(moment, spec)).toBe(format(moment, spec))
  })

  it('falls back to the locale default when no options are given', () => {
    expect(format(moment, { locale: 'en-GB' })).toBe('10/05/2026')
  })

  it('keeps formatting correctly after the cache is recycled', () => {
    const zones = Array.from({ length: 27 }, (_, index) =>
      index < 13 ? `Etc/GMT+${index}` : `Etc/GMT-${index - 12}`
    )

    zones.forEach((timeZone) => {
      ;[true, false].forEach((hour12) => {
        ;['en-GB', 'en-US'].forEach((locale) => {
          format(moment, {
            locale,
            timeZone,
            options: { ...CLOCK_OPTIONS, hour12 }
          })
        })
      })
    })

    expect(format(moment, { locale: 'en-GB', options: CLOCK_OPTIONS })).toBe(
      '14:30'
    )
  })
})

describe('timeZoneOf', () => {
  it('reads the annotation when the runtime exposes no identifier', () => {
    const annotated = {
      toString: () => '2026-05-10T14:30:00+03:00[Europe/Kyiv]'
    } as unknown as Moment

    expect(timeZoneOf(annotated)).toBe(KYIV)
  })

  it('prefers the identifier the runtime exposes', () => {
    const declared = {
      timeZoneId: NEW_YORK,
      toString: () => '2026-05-10T14:30:00+03:00[Europe/Kyiv]'
    } as unknown as Moment

    expect(timeZoneOf(declared)).toBe(NEW_YORK)
  })

  it('falls back to UTC when nothing identifies the zone', () => {
    const bare = {
      toString: () => '2026-05-10T14:30:00+00:00'
    } as unknown as Moment

    expect(timeZoneOf(bare)).toBe('UTC')
  })

  it('returns an identifier that resolves to the same instant', () => {
    const moment = zoned('2026-05-10T14:30:00', KYIV)

    expect(toIso(zoned(toIso(moment), timeZoneOf(moment)))).toBe(toIso(moment))
  })
})

describe('now', () => {
  it('reads the current instant in the requested zone', () => {
    const before = Date.now()
    const current = now(KYIV).epochMilliseconds
    const after = Date.now()

    expect(current).toBeGreaterThanOrEqual(before)
    expect(current).toBeLessThanOrEqual(after)
  })
})
