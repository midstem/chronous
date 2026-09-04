import type {
  CalendarLayout,
  CalendarRange,
  CalendarRow,
  LocaleId
} from '@midstem/chronous'
import type { Signal } from '@angular/core'

export type CalendarContext<TData = unknown> = {
  calendar: Signal<CalendarLayout<TData>>
  range: Signal<CalendarRange>
  locale: Signal<LocaleId>
  gutterWidth: Signal<string>
}

export type TimeGridContext = {
  hourHeight: Signal<number>
  dayHeight: Signal<number>
}

export type AllDayContext<TData = unknown> = {
  row: Signal<CalendarRow<TData>>
  laneHeight: Signal<number>
  lanes: Signal<number>
}
