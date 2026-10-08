import type { ChronousCalendarView } from '@/components/ui/chronous-calendar'

export type PlaygroundSettings = {
  view?: ChronousCalendarView
  date?: string
  timeZone?: string
  locale: string
  withEvents: boolean
}

export type SettingsProps = {
  locale: string
  timeZone?: string
  onLocale: (locale: string) => void
  onTimeZone: (timeZone: string | undefined) => void
}
