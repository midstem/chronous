import type {
  CalendarBar,
  CalendarBox,
  CalendarDay,
  CalendarLayout,
  CalendarRange,
  CalendarRow,
  LocaleId
} from '@midstem/chronous'

export type CalendarContextValue<TData = unknown> = {
  calendar: CalendarLayout<TData>
  range: CalendarRange
  locale: LocaleId
  gutterWidth: string
}

export type TimeGridContextValue = {
  hourHeight: number
  dayHeight: number
}

export type DayColumnContextValue<TData = unknown> = {
  day: CalendarDay<TData>
}

export type AllDayContextValue<TData = unknown> = {
  row: CalendarRow<TData>
  laneHeight: number
  lanes: number
}

export type MonthRowContextValue<TData = unknown> = {
  row: CalendarRow<TData>
  days: CalendarDay<TData>[]
  maxLanes: number | null
  laneHeight: number
}

export type MonthDayContextValue<TData = unknown> = {
  day: CalendarDay<TData>
  boxes: CalendarBox<TData>[]
  bars: CalendarBar<TData>[]
  hiddenBars: CalendarBar<TData>[]
}

export type AgendaDayContextValue<TData = unknown> = {
  day: CalendarDay<TData>
  bars: CalendarBar<TData>[]
  boxes: CalendarBox<TData>[]
}
