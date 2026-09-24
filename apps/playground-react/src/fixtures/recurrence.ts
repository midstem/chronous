import type { EventInput } from '@midstem/chronous-react'

import type { EventData } from '../types'

export const RECURRENCE: readonly EventInput<EventData>[] = [
  {
    id: 'weekdays',
    start: '2026-03-23T08:00:00',
    duration: 'PT15M',
    recurrence: {
      rule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
      exceptions: ['2026-03-25T08:00:00'],
      overrides: [
        {
          recurrenceId: '2026-03-27T08:00:00',
          start: '2026-03-27T11:00:00',
          data: { title: 'Weekday check (moved)' }
        }
      ]
    },
    data: { title: 'Weekday check' }
  },
  {
    id: 'counted',
    start: '2026-03-23T12:00:00',
    end: '2026-03-23T12:30:00',
    recurrence: { rule: 'FREQ=DAILY;COUNT=4' },
    data: { title: 'Four days only' }
  },
  {
    id: 'every-other',
    start: '2026-03-24T14:00:00',
    end: '2026-03-24T15:00:00',
    recurrence: { rule: 'FREQ=DAILY;INTERVAL=2;UNTIL=20260401T000000Z' },
    data: { title: 'Every other day' }
  },
  {
    id: 'last-friday',
    start: '2026-03-27T16:00:00',
    end: '2026-03-27T17:00:00',
    recurrence: { rule: 'FREQ=MONTHLY;BYDAY=-1FR' },
    data: { title: 'Last Friday' }
  },
  {
    id: 'month-days',
    start: '2026-03-25T18:00:00',
    duration: 'PT45M',
    recurrence: { rule: 'FREQ=MONTHLY;BYMONTHDAY=25,26' },
    data: { title: 'On the 25th and 26th' }
  },
  {
    id: 'listed',
    start: '2026-03-23T07:00:00',
    duration: 'PT30M',
    recurrence: {
      dates: ['2026-03-24T07:00:00', '2026-03-26T19:00:00'],
      overrides: [{ recurrenceId: '2026-03-26T19:00:00', cancelled: true }]
    },
    data: { title: 'Listed dates' }
  }
]
