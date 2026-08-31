import type {
  Calendar,
  CalendarBar,
  CalendarBox,
  CalendarDay,
  CalendarRow,
  LocaleId,
  RangeSpec
} from '@midstem/chronous'

export type CalendarContextValue<TData = unknown> = {
  calendar: Calendar<TData>
  spec: RangeSpec
  locale: LocaleId
  gutter: string
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
}

export type MonthRowContextValue<TData = unknown> = {
  row: CalendarRow<TData>
  days: CalendarDay<TData>[]
}

export type MonthDayContextValue<TData = unknown> = {
  day: CalendarDay<TData>
  boxes: CalendarBox<TData>[]
}

export type AgendaDayContextValue<TData = unknown> = {
  day: CalendarDay<TData>
  bars: CalendarBar<TData>[]
  boxes: CalendarBox<TData>[]
}
