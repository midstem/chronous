import type { EventInput } from '@midstem/chronous-react'

import type { EventData } from '../types'

export const ALL_DAY: readonly EventInput<EventData>[] = [
  {
    id: 'single',
    start: '2026-03-24',
    data: { title: 'One day' }
  },
  {
    id: 'exclusive-end',
    start: '2026-03-25',
    end: '2026-03-27',
    data: { title: 'Two days, end is exclusive' }
  },
  {
    id: 'flagged',
    start: '2026-03-26T09:00:00',
    end: '2026-03-27T17:00:00',
    allDay: true,
    data: { title: 'Flagged all-day, clock dropped' }
  },
  {
    id: 'week-long',
    start: '2026-03-23',
    end: '2026-03-30',
    data: { title: 'A whole week' }
  },
  {
    id: 'overlapping',
    start: '2026-03-24',
    end: '2026-03-28',
    data: { title: 'Overlaps into a second lane' }
  },
  {
    id: 'third-lane',
    start: '2026-03-25',
    end: '2026-03-26',
    data: { title: 'And a third' }
  },
  {
    id: 'promoted',
    start: '2026-03-24T00:00:00',
    end: '2026-03-25T00:00:00',
    data: { title: 'Timed, but 24 wall hours long' }
  },
  {
    id: 'stays-timed',
    start: '2026-03-24T08:00:00',
    end: '2026-03-25T07:00:00',
    data: { title: 'Timed, 23 hours, stays in the grid' }
  }
]
