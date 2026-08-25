import { bench, describe } from 'vitest'

import { normalizeEvents } from '#src/event'
import type { NormalizeContext } from '#src/event'
import { buildLayout } from '#src/layout'
import { buildRange } from '#src/range'

import { HEAVY, allDayEvents, timedEvents } from './helpers'

const KYIV = 'Europe/Kyiv'

const ANCHOR = '2026-03-23'

const context: NormalizeContext = { timeZone: KYIV }

const week = buildRange({ view: 'week', date: ANCHOR, timeZone: KYIV })

const month = buildRange({ view: 'month', date: ANCHOR, timeZone: KYIV })

const spread = normalizeEvents(timedEvents(10_000, 7, ANCHOR), context)

const crowded = normalizeEvents(timedEvents(10_000, 1, ANCHOR), context)

const bars = normalizeEvents(allDayEvents(1_000, 28, ANCHOR), context)

describe('a week of boxes', () => {
  bench(
    '10k events over seven days',
    () => {
      buildLayout(week, spread)
    },
    HEAVY
  )

  bench(
    '10k events on one day',
    () => {
      buildLayout(week, crowded)
    },
    HEAVY
  )
})

describe('a month of bars', () => {
  bench('1k all-day events over four weeks', () => {
    buildLayout(month, bars)
  })
})
