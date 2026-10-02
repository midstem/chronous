import type {
  CalendarBar,
  CalendarDay,
  CalendarLayout,
  CalendarRow,
  IsoDate,
  TimeZoneId
} from '@midstem/chronous'
import { CONTINUES } from '@midstem/playground-core'

export type CalendarNow = {
  date: IsoDate
  minuteOfDay: number
}

export const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quot;'
      default:
        return '&#39;'
    }
  })

const PARTS_LOCALE = 'en-US'
const MINUTES_IN_DAY = 1440
const PERCENT = 100

export const getNow = (timeZone: TimeZoneId): CalendarNow | null => {
  try {
    const formatter = new Intl.DateTimeFormat(PARTS_LOCALE, {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    const parts: Record<string, string> = {}
    for (const part of formatter.formatToParts(new Date())) {
      parts[part.type] = part.value
    }
    const hour = Number(parts.hour) % 24
    return {
      date: `${parts.year}-${parts.month}-${parts.day}`,
      minuteOfDay: hour * 60 + Number(parts.minute)
    }
  } catch {
    return null
  }
}

export const percentOf = (fraction: number): string => `${fraction * PERCENT}%`

export const minutePercentOf = (minuteOfDay: number): string =>
  percentOf(minuteOfDay / MINUTES_IN_DAY)

export const edge = (shown: boolean): string => (shown ? CONTINUES : '')

export type RowWithDays<TData> = {
  row: CalendarRow<TData>
  days: CalendarDay<TData>[]
}

export const rowsWithDays = <TData>(
  calendar: CalendarLayout<TData>
): RowWithDays<TData>[] => {
  let taken = 0
  return calendar.rows.map((row) => {
    const days = calendar.days.slice(taken, taken + row.dayCount)
    taken += row.dayCount
    return { row, days }
  })
}

export const rowBarsByDay = <TData>(
  row: CalendarRow<TData>,
  dayCount: number
): CalendarBar<TData>[][] => {
  const byDay: CalendarBar<TData>[][] = Array.from(
    { length: dayCount },
    () => []
  )
  for (const bar of row.bars) {
    for (let offset = bar.startDay; offset < bar.endDay; offset += 1) {
      byDay[offset]?.push(bar)
    }
  }
  return byDay
}

export const barsByDay = <TData>(
  calendar: CalendarLayout<TData>
): CalendarBar<TData>[][] => {
  const byDay: CalendarBar<TData>[][] = calendar.days.map(() => [])
  let taken = 0
  for (const row of calendar.rows) {
    for (const bar of row.bars) {
      for (let offset = bar.startDay; offset < bar.endDay; offset += 1) {
        byDay[taken + offset]?.push(bar)
      }
    }
    taken += row.dayCount
  }
  return byDay
}

export const laneCount = (lanes: number, maxLanes: number | null): number =>
  maxLanes === null ? lanes : Math.min(lanes, maxLanes)

export const visibleLanes = <TData>(
  bars: CalendarBar<TData>[],
  maxLanes: number | null
): CalendarBar<TData>[] =>
  maxLanes === null ? bars : bars.filter((bar) => bar.lane < maxLanes)

export const hiddenLanes = <TData>(
  bars: CalendarBar<TData>[],
  maxLanes: number | null
): CalendarBar<TData>[] =>
  maxLanes === null ? [] : bars.filter((bar) => bar.lane >= maxLanes)
