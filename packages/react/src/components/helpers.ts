import type {
  CalendarBar,
  CalendarDay,
  CalendarLayout,
  CalendarRow,
  DateTimeFormatOptions,
  LocaleId
} from '@midstem/chronous'
import { formatIso } from '@midstem/chronous'
import type { CSSProperties, ElementType, ReactNode } from 'react'

import type { ScopedChildren } from './types'

export const PERCENT = 100

export const MINUTES_IN_DAY = 1440

export const HOURS_IN_DAY = 24

export const GUTTER_WIDTH = '3.25rem'

export const WEEKDAY: DateTimeFormatOptions = { weekday: 'short' }

export const DAY_NUMBER: DateTimeFormatOptions = { day: 'numeric' }

export const MONTH: DateTimeFormatOptions = { month: 'short' }

export const CLOCK: DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit'
}

export const percentOf = (fraction: number): string => `${fraction * PERCENT}%`

export const minutePercentOf = (minuteOfDay: number): string =>
  percentOf(minuteOfDay / MINUTES_IN_DAY)

export const templateOf = (gutterWidth: string, columns: number): string =>
  `${gutterWidth} repeat(${columns}, minmax(0, 1fr))`

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

export const renderChildren = <TScope>(
  slot: ScopedChildren<TScope> | undefined,
  scope: TScope,
  fallback: ReactNode
): ReactNode => {
  if (slot === undefined) return fallback

  return typeof slot === 'function' ? slot(scope) : slot
}

export const labelOf = (
  value: string,
  locale: LocaleId,
  options: DateTimeFormatOptions
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
  calendar: CalendarLayout<TData>
): RowWithDays<TData>[] => {
  let taken = 0

  return calendar.rows.map((row) => {
    const days = calendar.days.slice(taken, taken + row.dayCount)

    taken += row.dayCount

    return { row, days }
  })
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
