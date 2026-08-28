import { useEffect, useState } from 'react'

export type Now = { date: string; minuteOfDay: number }

const TICK_MS = 30_000
const DATE_LOCALE = 'en-CA'
const CLOCK_LOCALE = 'en-GB'

const readNow = (tz: string, at: Date): Now | null => {
  try {
    const date = new Intl.DateTimeFormat(DATE_LOCALE, {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(at)

    const clock = new Intl.DateTimeFormat(CLOCK_LOCALE, {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(at)

    const [h, m] = clock.split(':').map(Number)
    return { date, minuteOfDay: (h % 24) * 60 + m }
  } catch {
    return null
  }
}

export const useNow = (tz: string): Now | null => {
  const [at, setAt] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setAt(new Date()), TICK_MS)
    return () => window.clearInterval(id)
  }, [])

  return readNow(tz, at)
}
