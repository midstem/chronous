import type {
  CalendarBar,
  CalendarBox,
  CalendarDay,
  CalendarLayout,
  CalendarRange,
  CalendarRow,
  LocaleId
} from '@midstem/chronous'
import type { ComputedRef } from 'vue'

export type CalendarContextValue<TData = unknown> = {
  calendar: ComputedRef<CalendarLayout<TData>>
  range: ComputedRef<CalendarRange>
  locale: ComputedRef<LocaleId>
  gutterWidth: ComputedRef<string>
}

export type TimeGridContextValue = {
  hourHeight: ComputedRef<number>
  dayHeight: ComputedRef<number>
}

export type DayColumnContextValue<TData = unknown> = {
  day: ComputedRef<CalendarDay<TData>>
}

export type AllDayContextValue<TData = unknown> = {
  row: ComputedRef<CalendarRow<TData>>
  laneHeight: ComputedRef<number>
  lanes: ComputedRef<number>
}

export type MonthRowContextValue<TData = unknown> = {
  row: ComputedRef<CalendarRow<TData>>
  days: ComputedRef<CalendarDay<TData>[]>
  maxLanes: ComputedRef<number | null>
  laneHeight: ComputedRef<number>
}

export type MonthDayContextValue<TData = unknown> = {
  day: ComputedRef<CalendarDay<TData>>
  boxes: ComputedRef<CalendarBox<TData>[]>
  bars: ComputedRef<CalendarBar<TData>[]>
  hiddenBars: ComputedRef<CalendarBar<TData>[]>
}

export type AgendaDayContextValue<TData = unknown> = {
  day: ComputedRef<CalendarDay<TData>>
  bars: ComputedRef<CalendarBar<TData>[]>
  boxes: ComputedRef<CalendarBox<TData>[]>
}
