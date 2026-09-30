import type {
  CalendarBar,
  CalendarDay,
  CalendarLayout,
  CalendarRow,
  DateTimeFormatOptions,
  LocaleId
} from '../engine.js'
import { formatIso } from '../engine.js'
import type { Snippet } from 'svelte'

export const GUTTER_WIDTH = '3.25rem'
export const WEEKDAY: DateTimeFormatOptions = { weekday: 'short' }
export const DAY_NUMBER: DateTimeFormatOptions = { day: 'numeric' }
export const MONTH: DateTimeFormatOptions = { month: 'short' }
export const CLOCK: DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit'
}
export const percentOf = (n: number): string => `${n * 100}%`
export const minutePercentOf = (n: number): string => percentOf(n / 1440)
export const templateOf = (gutter: string, columns: number): string =>
  `${gutter} repeat(${columns}, minmax(0, 1fr))`
export const columnsOf = (columns: number): string =>
  `repeat(${columns}, minmax(0, 1fr))`
export const styleText = (
  style: Record<string, string | number | undefined>,
  custom?: string | Record<string, string | number>
): string => {
  const entries = {
    ...style,
    ...(typeof custom === 'string' ? {} : (custom ?? {}))
  }
  const cssName = (name: string): string =>
    name.startsWith('--')
      ? name
      : name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
  const unitless = new Set([
    'zIndex',
    'flex',
    'flexGrow',
    'flexShrink',
    'fontWeight',
    'lineHeight',
    'opacity',
    'order'
  ])
  const generated = Object.entries(entries)
    .filter(([, value]) => value !== undefined)
    .map(
      ([name, value]) =>
        `${cssName(name)}:${typeof value === 'number' && value !== 0 && !unitless.has(name) && !name.startsWith('--') ? `${value}px` : value}`
    )
    .join(';')
  return `${generated}${typeof custom === 'string' ? `;${custom}` : ''}`
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
export const rowsWithDays = <T>(
  calendar: CalendarLayout<T>
): { row: CalendarRow<T>; days: CalendarDay<T>[] }[] => {
  let taken = 0
  return calendar.rows.map((row) => {
    const days = calendar.days.slice(taken, taken + row.dayCount)
    taken += row.dayCount
    return { row, days }
  })
}
export const rowBarsByDay = <T>(
  row: CalendarRow<T>,
  count: number
): CalendarBar<T>[][] => {
  const result = Array.from({ length: count }, () => [] as CalendarBar<T>[])
  for (const bar of row.bars)
    for (let i = bar.startDay; i < bar.endDay; i++) result[i]?.push(bar)
  return result
}
export const barsByDay = <T>(
  calendar: CalendarLayout<T>
): CalendarBar<T>[][] => {
  const result = calendar.days.map(() => [] as CalendarBar<T>[])
  let taken = 0
  for (const row of calendar.rows) {
    for (const bar of row.bars)
      for (let i = bar.startDay; i < bar.endDay; i++)
        result[taken + i]?.push(bar)
    taken += row.dayCount
  }
  return result
}
export const laneCount = (count: number, max: number | null): number =>
  max === null ? count : Math.min(count, max)
export const visibleLanes = <T>(
  bars: CalendarBar<T>[],
  max: number | null
): CalendarBar<T>[] =>
  max === null ? bars : bars.filter((bar) => bar.lane < max)
export const hiddenLanes = <T>(
  bars: CalendarBar<T>[],
  max: number | null
): CalendarBar<T>[] =>
  max === null ? [] : bars.filter((bar) => bar.lane >= max)
export type ScopedChildren<T> = Snippet<[T]>
