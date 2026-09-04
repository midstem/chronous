import type { TimeZoneId } from '@midstem/chronous'

import type { CalendarNow } from './types'

const PARTS_LOCALE = 'en-US'

const MINUTES_IN_HOUR = 60

const HOURS_IN_DAY = 24

export const TICK_MS = 30_000

export const formatterOf = (
  timeZone: TimeZoneId
): Intl.DateTimeFormat | null => {
  try {
    return new Intl.DateTimeFormat(PARTS_LOCALE, {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  } catch {
    return null
  }
}

export const nowOf = (
  formatter: Intl.DateTimeFormat | null,
  at: Date | null
): CalendarNow | null => {
  if (!formatter || !at) return null

  const parts: Record<string, string> = {}

  for (const part of formatter.formatToParts(at)) parts[part.type] = part.value

  const hour = Number(parts.hour) % HOURS_IN_DAY

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minuteOfDay: hour * MINUTES_IN_HOUR + Number(parts.minute)
  }
}
