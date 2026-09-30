import { readable, type Readable } from 'svelte/store'
import type { IsoDate, TimeZoneId } from '../../engine.js'
export type CalendarNow = { date: IsoDate; minuteOfDay: number }
const TICK_MS = 30_000
const formatterOf = (timeZone: TimeZoneId): Intl.DateTimeFormat | null => {
  try {
    return new Intl.DateTimeFormat('en-US', {
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
  at: Date
): CalendarNow | null => {
  if (!formatter) return null
  const parts: Record<string, string> = {}
  for (const part of formatter.formatToParts(at)) parts[part.type] = part.value
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minuteOfDay: (Number(parts.hour) % 24) * 60 + Number(parts.minute)
  }
}
/** Emits the zoned current time every 30 seconds and cleans up when the final subscriber leaves. */
export const useNow = (timeZone: TimeZoneId): Readable<CalendarNow | null> =>
  readable<CalendarNow | null>(null, (set) => {
    if (typeof window === 'undefined') return () => {}
    const formatter = formatterOf(timeZone)
    const update = (): void => set(nowOf(formatter, new Date()))
    update()
    const id = window.setInterval(update, TICK_MS)
    return () => window.clearInterval(id)
  })
