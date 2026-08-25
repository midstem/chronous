import { bench, describe } from 'vitest'

import { buildCalendar } from '#src/calendar'
import type { RangeSpec } from '#src/range'
import { formatIso } from '#src/time'
import type { FormatOptions } from '#src/time'

const KYIV = 'Europe/Kyiv'

const ANCHOR = '2026-03-23'

const DAY_OPTIONS: FormatOptions = { day: 'numeric', month: 'long' }

const CLOCK_OPTIONS: FormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}

const monthSpec: RangeSpec = { view: 'month', date: ANCHOR, timeZone: KYIV }

const month = buildCalendar(monthSpec, [])

const week = buildCalendar({ view: 'week', date: ANCHOR, timeZone: KYIV }, [])

const dates = month.days.map((day) => day.date)

const slots = week.days.flatMap((day) => day.slots.map((slot) => slot.start))

describe('labels', () => {
  bench('42 day headings', () => {
    for (const date of dates)
      formatIso(date, { locale: 'en-GB', options: DAY_OPTIONS })
  })

  bench('168 clock labels', () => {
    for (const start of slots)
      formatIso(start, { locale: 'en-GB', options: CLOCK_OPTIONS })
  })
})
