import type { EventInput } from '@midstem/chronous-react'

import type { EventData } from '../types'

export const DST: readonly EventInput<EventData>[] = [
  {
    id: 'across-the-gap',
    start: '2026-03-29T01:30:00',
    end: '2026-03-29T04:00:00',
    data: { title: 'Across the spring forward' }
  },
  {
    id: 'inside-the-gap',
    start: '2026-03-29T03:30:00',
    duration: 'PT30M',
    data: { title: 'Starts in the hour that never happens' }
  },
  {
    id: 'wall-day',
    start: '2026-03-29T00:00:00',
    end: '2026-03-30T00:00:00',
    data: { title: '24 wall hours, 23 real ones' }
  },
  {
    id: 'daily-through',
    start: '2026-03-27T02:30:00',
    duration: 'PT1H',
    recurrence: { rule: 'FREQ=DAILY;COUNT=5' },
    data: { title: 'Daily 02:30, keeps the wall clock' }
  },
  {
    id: 'foreign-zone',
    start: '2026-03-29T12:00:00',
    end: '2026-03-29T13:00:00',
    timeZone: 'Asia/Kolkata',
    data: { title: 'Written in Asia/Kolkata' }
  },
  {
    id: 'the-day-itself',
    start: '2026-03-29',
    data: { title: 'The day the clocks move' }
  }
]
