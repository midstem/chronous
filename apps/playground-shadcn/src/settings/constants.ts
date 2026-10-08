import type { ChronousCalendarView } from '@/components/ui/chronous-calendar'

export const DEFAULT_LOCALE = 'en-US'

export const LOCAL_TIME_ZONE = ''

export const VIEWS: readonly ChronousCalendarView[] = [
  'day',
  'week',
  'month',
  'agenda'
]

export const LOCALES = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'de-DE', label: 'Deutsch' },
  { value: 'uk-UA', label: 'Українська' },
  { value: 'ja-JP', label: '日本語' }
] as const

export const TIME_ZONES = [
  { value: LOCAL_TIME_ZONE, label: 'Browser time zone' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/Kyiv', label: 'Europe/Kyiv' },
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'America/New_York', label: 'America/New_York' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo' }
] as const
