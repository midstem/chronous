import type { TimeZoneId } from '@midstem/chronous'
import { useEffect, useMemo, useState } from 'react'

export type Now = {
  date: string
  minuteOfDay: number
}

const TICK_MS = 30_000

const PARTS_LOCALE = 'en-US'

const MINUTES_IN_HOUR = 60

const HOURS_IN_DAY = 24

const formatterOf = (timeZone: TimeZoneId): Intl.DateTimeFormat | null => {
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

const nowOf = (
  formatter: Intl.DateTimeFormat | null,
  at: Date | null
): Now | null => {
  if (!formatter || !at) return null

  const parts: Record<string, string> = {}

  for (const part of formatter.formatToParts(at)) parts[part.type] = part.value

  const hour = Number(parts.hour) % HOURS_IN_DAY

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minuteOfDay: hour * MINUTES_IN_HOUR + Number(parts.minute)
  }
}

export const useNow = (timeZone: TimeZoneId): Now | null => {
  const [at, setAt] = useState<Date | null>(null)
  const formatter = useMemo(() => formatterOf(timeZone), [timeZone])

  useEffect(() => {
    setAt(new Date())

    const id = window.setInterval(() => setAt(new Date()), TICK_MS)

    return () => window.clearInterval(id)
  }, [])

  return useMemo(() => nowOf(formatter, at), [formatter, at])
}
