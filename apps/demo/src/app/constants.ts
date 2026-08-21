import type {
  EventInput,
  LocaleId,
  RangeSpec,
  TimeZoneId,
  ViewKind
} from '@midstem/chronous'

import type { EventData } from './types'

export const LOCALE: LocaleId = 'en-GB'

export const INITIAL_SPEC: RangeSpec = {
  view: 'week',
  date: '2026-03-25',
  timeZone: 'Europe/Kyiv'
}

export const VIEWS: readonly ViewKind[] = [
  'day',
  'week',
  'days',
  'month',
  'agenda'
]

export const ZONES: readonly TimeZoneId[] = [
  'Europe/Kyiv',
  'America/Santiago',
  'Australia/Lord_Howe',
  'Asia/Kolkata'
]

export const EVENTS: readonly EventInput<EventData>[] = [
  {
    id: 'standup',
    start: '2026-03-24T09:00:00',
    end: '2026-03-24T09:30:00',
    data: { title: 'Standup' }
  },
  {
    id: 'review',
    start: '2026-03-24T09:15:00',
    end: '2026-03-24T10:15:00',
    data: { title: 'Review' }
  },
  {
    id: 'sync',
    start: '2026-03-24T09:45:00',
    end: '2026-03-24T10:30:00',
    data: { title: 'Sync' }
  },
  {
    id: 'night',
    start: '2026-03-25T22:00:00',
    end: '2026-03-26T02:00:00',
    data: { title: 'Night shift' }
  },
  {
    id: 'sprint',
    start: '2026-03-23T00:00:00',
    end: '2026-03-25T00:00:00',
    data: { title: 'Sprint window' }
  },
  {
    id: 'offsite',
    start: '2026-03-26',
    end: '2026-03-28',
    data: { title: 'Offsite' }
  },
  {
    id: 'clocks',
    start: '2026-03-29T01:30:00',
    end: '2026-03-29T04:00:00',
    data: { title: 'Across the clock change' }
  }
]
