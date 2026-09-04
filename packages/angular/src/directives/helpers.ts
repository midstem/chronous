import type {
  CalendarBar,
  CalendarBox,
  CalendarDay,
  CalendarLayout,
  CalendarRow,
  DateTimeFormatOptions,
  LocaleId
} from '@midstem/chronous'
import { formatIso } from '@midstem/chronous'

import type { ScopedContext } from './types'

export const PERCENT = 100

export const MINUTES_IN_DAY = 1440

export const HOURS_IN_DAY = 24

export const GUTTER_WIDTH = '3.25rem'

export const LOCALE: LocaleId = 'en-US'

export const WEEKDAY: DateTimeFormatOptions = { weekday: 'short' }

export const DAY_NUMBER: DateTimeFormatOptions = { day: 'numeric' }

export const MONTH: DateTimeFormatOptions = { month: 'short' }

export const CLOCK: DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit'
}

export const contextOf = <TItem, TScope extends object>(
  item: TItem,
  scope: TScope
): ScopedContext<TItem, TScope> => ({ ...scope, $implicit: item })

export const percentOf = (fraction: number): string => `${fraction * PERCENT}%`

export const pixelsOf = (length: number): string => `${length}px`

export const minutePercentOf = (minuteOfDay: number): string =>
  percentOf(minuteOfDay / MINUTES_IN_DAY)

export const templateOf = (gutterWidth: string, columns: number): string =>
  `${gutterWidth} repeat(${columns}, minmax(0, 1fr))`

export const columnsOf = (columns: number): string =>
  `repeat(${columns}, minmax(0, 1fr))`

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

export const rowBarsByDay = <TData>(
  row: CalendarRow<TData>,
  dayCount: number
): CalendarBar<TData>[][] => {
  const byDay: CalendarBar<TData>[][] = Array.from(
    { length: dayCount },
    () => []
  )

  for (const bar of row.bars)
    for (let offset = bar.startDay; offset < bar.endDay; offset += 1)
      byDay[offset]?.push(bar)

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

export const dayAttributes = <TData>(
  day: CalendarDay<TData>
): Record<string, string> => ({
  'data-date': day.date,
  'data-in-current-period': `${day.inCurrentPeriod}`
})

export type CalendarSpan<TData> = CalendarBar<TData> | CalendarBox<TData>

export const spanAttributes = <TData>(
  span: CalendarSpan<TData>
): Record<string, string> => ({
  'data-event-id': span.event.id,
  'data-continues-before': `${span.continuesBefore}`,
  'data-continues-after': `${span.continuesAfter}`
})

export const eventAttributes = <TData>(
  span: CalendarSpan<TData>
): Record<string, string> => ({ 'data-event-id': span.event.id })
