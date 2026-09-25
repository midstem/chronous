import { scopeOf } from './helpers'
import type {
  AgendaDayContextValue,
  AllDayContextValue,
  CalendarContextValue,
  DayColumnContextValue,
  MonthDayContextValue,
  MonthRowContextValue,
  TimeGridContextValue
} from './types'

const calendar = scopeOf<CalendarContextValue>(
  'CalendarContext',
  'Calendar.Root'
)

const timeGrid = scopeOf<TimeGridContextValue>(
  'TimeGridContext',
  'Calendar.TimeGrid'
)

const dayColumn = scopeOf<DayColumnContextValue>(
  'DayColumnContext',
  'Calendar.DayColumns'
)

const allDay = scopeOf<AllDayContextValue>(
  'AllDayContext',
  'Calendar.AllDayRow'
)

const monthRow = scopeOf<MonthRowContextValue>(
  'MonthRowContext',
  'Calendar.MonthRows'
)

const monthDay = scopeOf<MonthDayContextValue>(
  'MonthDayContext',
  'Calendar.MonthDays'
)

const agendaDay = scopeOf<AgendaDayContextValue>(
  'AgendaDayContext',
  'Calendar.AgendaDays'
)

export const provideCalendarContext = calendar.provideScope
export const useCalendarContext = <
  TData = unknown
>(): CalendarContextValue<TData> =>
  calendar.useScope() as CalendarContextValue<TData>

export const provideTimeGridContext = timeGrid.provideScope
export const useTimeGridContext = (): TimeGridContextValue =>
  timeGrid.useScope()

export const provideDayColumnContext = dayColumn.provideScope
export const useDayColumnContext = <
  TData = unknown
>(): DayColumnContextValue<TData> =>
  dayColumn.useScope() as DayColumnContextValue<TData>

export const provideAllDayContext = allDay.provideScope
export const useAllDayContext = <
  TData = unknown
>(): AllDayContextValue<TData> => allDay.useScope() as AllDayContextValue<TData>

export const provideMonthRowContext = monthRow.provideScope
export const useMonthRowContext = <
  TData = unknown
>(): MonthRowContextValue<TData> =>
  monthRow.useScope() as MonthRowContextValue<TData>

export const provideMonthDayContext = monthDay.provideScope
export const useMonthDayContext = <
  TData = unknown
>(): MonthDayContextValue<TData> =>
  monthDay.useScope() as MonthDayContextValue<TData>

export const provideAgendaDayContext = agendaDay.provideScope
export const useAgendaDayContext = <
  TData = unknown
>(): AgendaDayContextValue<TData> =>
  agendaDay.useScope() as AgendaDayContextValue<TData>

export type * from './types'
