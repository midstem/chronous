import { bench, describe } from 'vitest'

import { buildCalendar } from '#src/calendar'
import type { CalendarRange } from '#src/range'

import { HEAVY, timedEvents } from './helpers'

const KYIV = 'Europe/Kyiv'

const ANCHOR = '2026-03-23'

const day: CalendarRange = { view: 'day', date: ANCHOR, timeZone: KYIV }

const week: CalendarRange = { view: 'week', date: ANCHOR, timeZone: KYIV }

const month: CalendarRange = { view: 'month', date: ANCHOR, timeZone: KYIV }

const thousand = timedEvents(1_000, 1, ANCHOR)

const spread = timedEvents(10_000, 7, ANCHOR)

const monthly = timedEvents(10_000, 42, '2026-02-23')

describe('the public entry', () => {
  bench('a day of 1k events', () => {
    buildCalendar(day, thousand)
  })

  bench(
    'a week of 10k events',
    () => {
      buildCalendar(week, spread)
    },
    HEAVY
  )

  bench(
    'a month of 10k events',
    () => {
      buildCalendar(month, monthly)
    },
    HEAVY
  )

  bench('an empty week', () => {
    buildCalendar(week, [])
  })
})
