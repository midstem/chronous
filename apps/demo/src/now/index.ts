import { useEffect, useState } from 'react'
import type { IsoDate, TimeZoneId } from '@midstem/chronous'

import {
  CLOCK_LOCALE,
  CLOCK_SEPARATOR,
  DATE_LOCALE,
  HOURS_IN_DAY,
  MINUTES_IN_HOUR,
  TICK_MS
} from './constants'

export type Now = {
  date: IsoDate
  minuteOfDay: number
}

const readNow = (timeZone: TimeZoneId, at: Date): Now | null => {
  try {
    const date = new Intl.DateTimeFormat(DATE_LOCALE, {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(at)

    const clock = new Intl.DateTimeFormat(CLOCK_LOCALE, {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(at)

    const [hour, minute] = clock.split(CLOCK_SEPARATOR).map(Number)

    return {
      date,
      minuteOfDay: (hour % HOURS_IN_DAY) * MINUTES_IN_HOUR + minute
    }
  } catch {
    return null
  }
}

export const useNow = (timeZone: TimeZoneId): Now | null => {
  const [at, setAt] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setAt(new Date()), TICK_MS)

    return () => window.clearInterval(timer)
  }, [])

  return readNow(timeZone, at)
}
