import { getContext, setContext } from 'svelte'
import type {
  AgendaDayContextValue,
  AllDayContextValue,
  CalendarContextValue,
  DayColumnContextValue,
  MonthDayContextValue,
  MonthRowContextValue,
  TimeGridContextValue
} from './types'

const keys = {
  calendar: 'chronous:calendar',
  grid: 'chronous:grid',
  day: 'chronous:day',
  allDay: 'chronous:all-day',
  monthRow: 'chronous:month-row',
  monthDay: 'chronous:month-day',
  agendaDay: 'chronous:agenda-day'
} as const
const required = <T>(key: string, owner: string): T => {
  const value = getContext<T | undefined>(key)
  if (value === undefined)
    throw new Error(
      `${owner} is only readable inside its matching Calendar provider`
    )
  return value
}
export const provideCalendar = <T>(
  value: CalendarContextValue<T>
): CalendarContextValue<T> => setContext(keys.calendar, value)
export const provideTimeGrid = (
  value: TimeGridContextValue
): TimeGridContextValue => setContext(keys.grid, value)
export const provideDayColumn = <T>(
  value: DayColumnContextValue<T>
): DayColumnContextValue<T> => setContext(keys.day, value)
export const provideAllDay = <T>(
  value: AllDayContextValue<T>
): AllDayContextValue<T> => setContext(keys.allDay, value)
export const provideMonthRow = <T>(
  value: MonthRowContextValue<T>
): MonthRowContextValue<T> => setContext(keys.monthRow, value)
export const provideMonthDay = <T>(
  value: MonthDayContextValue<T>
): MonthDayContextValue<T> => setContext(keys.monthDay, value)
export const provideAgendaDay = <T>(
  value: AgendaDayContextValue<T>
): AgendaDayContextValue<T> => setContext(keys.agendaDay, value)
export const useCalendarContext = <T = unknown>(): CalendarContextValue<T> =>
  required<CalendarContextValue<T>>(keys.calendar, 'Calendar context')
export const useTimeGridContext = (): TimeGridContextValue =>
  required<TimeGridContextValue>(keys.grid, 'Time grid context')
export const useDayColumnContext = <T = unknown>(): DayColumnContextValue<T> =>
  required<DayColumnContextValue<T>>(keys.day, 'Day column context')
export const useAllDayContext = <T = unknown>(): AllDayContextValue<T> =>
  required<AllDayContextValue<T>>(keys.allDay, 'All-day context')
export const useMonthRowContext = <T = unknown>(): MonthRowContextValue<T> =>
  required<MonthRowContextValue<T>>(keys.monthRow, 'Month row context')
export const useMonthDayContext = <T = unknown>(): MonthDayContextValue<T> =>
  required<MonthDayContextValue<T>>(keys.monthDay, 'Month day context')
export const useAgendaDayContext = <T = unknown>(): AgendaDayContextValue<T> =>
  required<AgendaDayContextValue<T>>(keys.agendaDay, 'Agenda day context')
export type * from './types'
