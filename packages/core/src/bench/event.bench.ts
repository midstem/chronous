import { bench, describe } from 'vitest'

import { normalizeEvents } from '#src/event'
import type { NormalizeContext } from '#src/event'
import { buildRange } from '#src/range'

import { HEAVY, allDayEvents, timedEvents } from './helpers'

const KYIV = 'Europe/Kyiv'

const ANCHOR = '2026-03-23'

const context: NormalizeContext = { timeZone: KYIV }

const timed = timedEvents(10_000, 7, ANCHOR)

const allDay = allDayEvents(10_000, 28, ANCHOR)

describe('normalization', () => {
  bench(
    '10k timed events',
    () => {
      normalizeEvents(timed, context)
    },
    HEAVY
  )

  bench(
    '10k all-day events',
    () => {
      normalizeEvents(allDay, context)
    },
    HEAVY
  )
})

describe('the range', () => {
  bench('a week of hourly slots', () => {
    buildRange({ view: 'week', date: ANCHOR, timeZone: KYIV })
  })

  bench('a month grid', () => {
    buildRange({ view: 'month', date: ANCHOR, timeZone: KYIV })
  })

  bench('a week of quarter-hour slots', () => {
    buildRange({
      view: 'week',
      date: ANCHOR,
      timeZone: KYIV,
      slotMinutes: 15
    })
  })
})
