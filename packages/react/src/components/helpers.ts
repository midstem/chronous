import type { Calendar, CalendarDay, CalendarRow } from '@midstem/chronous'
import { formatIso } from '@midstem/chronous'
import type { FormatSpec, LocaleId } from '@midstem/chronous'

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

export const PERCENT = 100
export const MINUTES_IN_DAY = 1440
export const HOURS_IN_DAY = 24

export const fractionOf = (minuteOfDay: number): number =>
  minuteOfDay / MINUTES_IN_DAY

export const templateOf = (gutterWidth: string, columns: number): string =>
  `${gutterWidth} repeat(${columns}, minmax(0, 1fr))`

// ---------------------------------------------------------------------------
// Row/day partitioning (same as demo's rowsWithDays)
// ---------------------------------------------------------------------------

export type RowWithDays<TData> = {
  row: CalendarRow<TData>
  days: CalendarDay<TData>[]
}

export const rowsWithDays = <TData>(
  calendar: Calendar<TData>
): RowWithDays<TData>[] => {
  let taken = 0

  return calendar.rows.map((row) => {
    const days = calendar.days.slice(taken, taken + row.days)
    taken += row.days
    return { row, days }
  })
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export const timeLabel = (iso: string, locale: LocaleId): string => {
  try {
    return formatIso(iso, {
      locale,
      options: { hour: '2-digit', minute: '2-digit' }
    })
  } catch {
    return iso
  }
}

export const weekdayLabel = (iso: string, locale: LocaleId): string => {
  try {
    return formatIso(iso, { locale, options: { weekday: 'short' } })
  } catch {
    return iso
  }
}

export const numberLabel = (iso: string, locale: LocaleId): string => {
  try {
    return formatIso(iso, { locale, options: { day: 'numeric' } })
  } catch {
    return iso
  }
}

export const formatRange = (
  start: string,
  end: string,
  locale: LocaleId
): string => `${timeLabel(start, locale)} – ${timeLabel(end, locale)}`

export const wallTimeOn = (date: string, minuteOfDay: number): string => {
  const h = String(Math.floor(minuteOfDay / 60)).padStart(2, '0')
  const m = String(minuteOfDay % 60).padStart(2, '0')
  return `${date}T${h}:${m}:00`
}

export const titleLabel = (spec: FormatSpec): string => {
  try {
    return formatIso(spec.locale, spec)
  } catch {
    return ''
  }
}
