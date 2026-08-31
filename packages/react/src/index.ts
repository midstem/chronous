export { CORE_PACKAGE, PACKAGE_NAME } from '#src/constants'

export { useCalendar } from '#src/calendar'

export type { CalendarError, CalendarResult } from '#src/calendar'

export { useCalendarNavigation } from '#src/navigation'

export type { CalendarNavigation } from '#src/navigation'

export { Calendar, createCalendar } from '#src/components'

export { useNow } from './components/slotted/use-now'

export type { Now } from './components/slotted/use-now'

export type * from '#src/components'

export {
  useAgendaDayContext,
  useAllDayContext,
  useCalendarContext,
  useDayColumnContext,
  useMonthDayContext,
  useMonthRowContext,
  useTimeGridContext
} from './components/context'

export type {
  AgendaDayContextValue,
  AllDayContextValue,
  CalendarContextValue,
  DayColumnContextValue,
  MonthDayContextValue,
  MonthRowContextValue,
  TimeGridContextValue
} from './components/context'
