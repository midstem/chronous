import type {
  Calendar,
  CalendarBar,
  CalendarDay,
  CalendarRow,
  FormatOptions,
  LocaleId
} from '@midstem/chronous'
import { formatIso } from '@midstem/chronous'
import type { CSSProperties, ElementType, ReactNode } from 'react'

import type { Slot } from './types'

export const PERCENT = 100

export const MINUTES_IN_DAY = 1440

export const HOURS_IN_DAY = 24

export const GUTTER = '3.25rem'

export const WEEKDAY: FormatOptions = { weekday: 'short' }

export const DAY_NUMBER: FormatOptions = { day: 'numeric' }

export const MONTH: FormatOptions = { month: 'short' }

export const CLOCK: FormatOptions = { hour: '2-digit', minute: '2-digit' }

export const percentOf = (fraction: number): string => `${fraction * PERCENT}%`

export const minutePercentOf = (minuteOfDay: number): string =>
  percentOf(minuteOfDay / MINUTES_IN_DAY)

export const templateOf = (gutter: string, columns: number): string =>
  `${gutter} repeat(${columns}, minmax(0, 1fr))`

export const columnsOf = (columns: number): string =>
  `repeat(${columns}, minmax(0, 1fr))`

export const tagOf = (
  as: ElementType | undefined,
  fallback: ElementType
): ElementType => as ?? fallback

export const styleOf = (
  layout: CSSProperties,
  style?: CSSProperties
): CSSProperties => (style ? { ...layout, ...style } : layout)

export const renderSlot = <TScope>(
  slot: Slot<TScope> | undefined,
  scope: TScope,
  fallback: ReactNode
): ReactNode => {
  if (slot === undefined) return fallback

  return typeof slot === 'function' ? slot(scope) : slot
}

export const labelOf = (
  value: string,
  locale: LocaleId,
  options: FormatOptions
): string => {
  try {
    return formatIso(value, { locale, options })
  } catch {
    return value
  }
}

export const rangeOf = (start: string, end: string, locale: LocaleId): string =>
  `${labelOf(start, locale, CLOCK)} – ${labelOf(end, locale, CLOCK)}`

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

export const barsByDay = <TData>(
  calendar: Calendar<TData>
): CalendarBar<TData>[][] => {
  const byDay: CalendarBar<TData>[][] = calendar.days.map(() => [])
  let taken = 0

  for (const row of calendar.rows) {
    for (const bar of row.bars) {
      for (let offset = bar.startDay; offset < bar.endDay; offset += 1) {
        byDay[taken + offset]?.push(bar)
      }
    }

    taken += row.days
  }

  return byDay
}
