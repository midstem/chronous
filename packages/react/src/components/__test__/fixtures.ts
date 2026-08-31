import type { EventInput, CalendarRange } from '@midstem/chronous'

export type EventData = {
  title: string
}

export const ZONE = 'Europe/Kyiv'

export const LOCALE = 'en-GB'

export const WEEK: CalendarRange = {
  view: 'week',
  date: '2026-03-18',
  timeZone: ZONE
}

export const MONTH: CalendarRange = {
  view: 'month',
  date: '2026-03-18',
  timeZone: ZONE
}

export const AGENDA: CalendarRange = {
  view: 'agenda',
  date: '2026-03-18',
  timeZone: ZONE
}

export const EVENTS: EventInput<EventData>[] = [
  {
    id: 'standup',
    start: '2026-03-18T09:00:00',
    end: '2026-03-18T10:30:00',
    data: { title: 'Standup' }
  },
  {
    id: 'review',
    start: '2026-03-18T10:00:00',
    end: '2026-03-18T11:00:00',
    data: { title: 'Review' }
  },
  {
    id: 'offsite',
    start: '2026-03-17',
    end: '2026-03-20',
    data: { title: 'Offsite' }
  }
]
