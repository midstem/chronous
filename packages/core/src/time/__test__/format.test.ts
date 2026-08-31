import { afterEach, describe, expect, it, vi } from 'vitest'

import { MISSING_TEMPORAL_MESSAGE } from '../constants'
import { format, formatIso, plainDate, zoned } from '../index'
import type { DateTimeFormatOptions } from '../types'

const KYIV = 'Europe/Kyiv'
const NEW_YORK = 'America/New_York'
const CLOCK_OPTIONS: DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}
const DATE_OPTIONS: DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}

afterEach(() => {
  vi.unstubAllGlobals()
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
    const range = { locale: 'en-GB', options: CLOCK_OPTIONS }

    expect(format(moment, range)).toBe(format(moment, range))
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

describe('formatIso', () => {
  it('renders a date-time in the offset it carries', () => {
    expect(
      formatIso('2026-05-10T14:30:00+03:00', {
        locale: 'en-GB',
        options: CLOCK_OPTIONS
      })
    ).toBe('14:30')
  })

  it('renders a date-time in the zone it is asked for', () => {
    expect(
      formatIso('2026-05-10T14:30:00+03:00', {
        locale: 'en-GB',
        timeZone: NEW_YORK,
        options: CLOCK_OPTIONS
      })
    ).toBe('07:30')
  })

  it('reads a trailing Z as UTC', () => {
    expect(
      formatIso('2026-05-10T11:30:00Z', {
        locale: 'en-GB',
        options: CLOCK_OPTIONS
      })
    ).toBe('11:30')
  })

  it('accepts an offset written without a separator', () => {
    expect(
      formatIso('2026-05-10T14:30:00+0300', {
        locale: 'en-GB',
        options: CLOCK_OPTIONS
      })
    ).toBe('14:30')
  })

  it('names the offset the string carries', () => {
    expect(
      formatIso('2026-05-10T14:30:00+03:00', {
        locale: 'en-GB',
        options: { ...CLOCK_OPTIONS, timeZoneName: 'short' }
      })
    ).toBe('14:30 GMT+3')
  })

  it('prefers a zone annotation to the offset beside it', () => {
    expect(
      formatIso('2026-05-10T07:30:00-04:00[America/New_York]', {
        locale: 'en-GB',
        options: CLOCK_OPTIONS
      })
    ).toBe('07:30')
  })

  it('renders a floating date-time as it is written', () => {
    expect(
      formatIso('2026-05-10T14:30:00', {
        locale: 'en-GB',
        options: CLOCK_OPTIONS
      })
    ).toBe('14:30')
  })

  it('reads a floating date-time as wall time in the zone it is asked for', () => {
    expect(
      formatIso('2026-05-10T14:30:00', {
        locale: 'en-GB',
        timeZone: NEW_YORK,
        options: CLOCK_OPTIONS
      })
    ).toBe('14:30')
  })

  it('renders a date-only value as the floating date it is', () => {
    expect(
      formatIso('2026-03-15', { locale: 'en-CA', options: DATE_OPTIONS })
    ).toBe('2026-03-15')
  })

  it('never shifts a date-only value into a zone', () => {
    expect(
      formatIso('2026-03-15', {
        locale: 'en-CA',
        timeZone: 'Pacific/Honolulu',
        options: DATE_OPTIONS
      })
    ).toBe('2026-03-15')
  })

  it('respects the locale', () => {
    expect(
      formatIso('2026-05-10T14:30:00+03:00', {
        locale: 'uk-UA',
        options: { month: 'long' }
      })
    ).toBe('травень')
  })

  it('falls back to the locale default when no options are given', () => {
    expect(formatIso('2026-05-10T14:30:00+03:00', { locale: 'en-GB' })).toBe(
      '10/05/2026'
    )
  })

  it('fails with a readable message when Temporal is missing', () => {
    vi.stubGlobal('Temporal', undefined)

    expect(() => formatIso('2026-03-15', { locale: 'en-GB' })).toThrow(
      MISSING_TEMPORAL_MESSAGE
    )
  })
})
