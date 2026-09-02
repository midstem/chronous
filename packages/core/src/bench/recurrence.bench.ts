import { bench, describe } from 'vitest'

import { buildCalendar } from '#src/calendar'
import type { CalendarRange } from '#src/range'

import { HEAVY, recurringEvents } from './helpers'

const KYIV = 'Europe/Kyiv'

const ANCHOR = '2026-03-23'

const week: CalendarRange = {
  view: 'week',
  currentDate: ANCHOR,
  timeZone: KYIV
}

const month: CalendarRange = {
  view: 'month',
  currentDate: ANCHOR,
  timeZone: KYIV
}

const daily = recurringEvents(100, 'FREQ=DAILY', '2026-03-01')

const weekdays = recurringEvents(
  100,
  'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
  '2026-03-01'
)

const ordinal = recurringEvents(100, 'FREQ=MONTHLY;BYDAY=-1FR', '2026-01-01')

const aged = recurringEvents(10, 'FREQ=DAILY', '2010-01-01')

const ancient = recurringEvents(10, 'FREQ=WEEKLY;BYDAY=MO', '2010-01-01')

describe('a week of series', () => {
  bench('100 daily series anchored three weeks back', () => {
    buildCalendar(week, daily)
  })

  bench('100 weekday series anchored three weeks back', () => {
    buildCalendar(week, weekdays)
  })

  bench(
    '10 daily series anchored sixteen years back',
    () => {
      buildCalendar(week, aged)
    },
    HEAVY
  )

  bench(
    '10 weekly series anchored sixteen years back',
    () => {
      buildCalendar(week, ancient)
    },
    HEAVY
  )
})

describe('a month of series', () => {
  bench('100 monthly series on an ordinal weekday', () => {
    buildCalendar(month, ordinal)
  })
})
