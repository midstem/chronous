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

export const CalendarProvider = calendar.Provider

export const TimeGridProvider = timeGrid.Provider

export const DayColumnProvider = dayColumn.Provider

export const AllDayProvider = allDay.Provider

export const MonthRowProvider = monthRow.Provider

export const MonthDayProvider = monthDay.Provider

export const AgendaDayProvider = agendaDay.Provider

export const useCalendarContext = <
  TData = unknown
>(): CalendarContextValue<TData> =>
  calendar.useScope() as CalendarContextValue<TData>

export const useTimeGridContext = (): TimeGridContextValue =>
  timeGrid.useScope()

export const useDayColumnContext = <
  TData = unknown
>(): DayColumnContextValue<TData> =>
  dayColumn.useScope() as DayColumnContextValue<TData>

export const useAllDayContext = <
  TData = unknown
>(): AllDayContextValue<TData> => allDay.useScope() as AllDayContextValue<TData>

export const useMonthRowContext = <
  TData = unknown
>(): MonthRowContextValue<TData> =>
  monthRow.useScope() as MonthRowContextValue<TData>

export const useMonthDayContext = <
  TData = unknown
>(): MonthDayContextValue<TData> =>
  monthDay.useScope() as MonthDayContextValue<TData>

export const useAgendaDayContext = <
  TData = unknown
>(): AgendaDayContextValue<TData> =>
  agendaDay.useScope() as AgendaDayContextValue<TData>

export type * from './types'
