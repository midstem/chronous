import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  PACKAGE_NAME,
  buildCalendar,
  formatIso,
  isTemporalAvailable
} from '../index'
import type { FormatOptions } from '../index'

const CLOCK_OPTIONS: FormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}
const DAY_OPTIONS: FormatOptions = { day: 'numeric', month: 'long' }

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('@midstem/chronous', () => {
  it('is published under the midstem scope', () => {
    expect(PACKAGE_NAME).toBe('@midstem/chronous')
  })

  it('reports Temporal as available in a prepared runtime', () => {
    expect(isTemporalAvailable()).toBe(true)
  })

  it('reports Temporal as missing when the runtime has none', () => {
    vi.stubGlobal('Temporal', undefined)

    expect(isTemporalAvailable()).toBe(false)
  })

  it('labels the strings a calendar hands back', () => {
    const calendar = buildCalendar(
      { view: 'day', date: '2026-03-29', timeZone: 'Europe/Kyiv' },
      []
    )
    const [day] = calendar.days

    expect(formatIso(day.date, { locale: 'en-GB', options: DAY_OPTIONS })).toBe(
      '29 March'
    )
    expect(
      formatIso(day.start, { locale: 'en-GB', options: CLOCK_OPTIONS })
    ).toBe('00:00')
    expect(
      formatIso(day.slots[4].start, {
        locale: 'en-GB',
        options: CLOCK_OPTIONS
      })
    ).toBe('04:00')
  })
})
