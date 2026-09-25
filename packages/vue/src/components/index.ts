import { AgendaAllDayEvents } from './agenda/agenda-all-day-events'
import { AgendaDays } from './agenda/agenda-days'
import { AgendaList } from './agenda/agenda-list'
import { AgendaTimedEvents } from './agenda/agenda-timed-events'
import { MonthAllDayEvents } from './month/month-all-day-events'
import { MonthDays } from './month/month-days'
import { MonthGrid } from './month/month-grid'
import { MonthRows } from './month/month-rows'
import { MonthTimedEvents } from './month/month-timed-events'
import { MonthWeekdays } from './month/month-weekdays'
import { AllDayEvents } from './shared/all-day-events'
import { AllDayRow } from './shared/all-day-row'
import { DayHeadings } from './shared/day-headings'
import { Header } from './shared/header'
import { Root } from './shared/root'
import { Toolbar } from './shared/toolbar'
import { DayColumns } from './slotted/day-columns'
import { NowMarker } from './slotted/now-marker'
import { TimeAxis } from './slotted/time-axis'
import { TimeGrid } from './slotted/time-grid'
import { TimeLabels } from './slotted/time-labels'
import { TimeSlots } from './slotted/time-slots'
import { TimedEvents } from './slotted/timed-events'

export {
  Root,
  Toolbar,
  Header,
  DayHeadings,
  AllDayRow,
  AllDayEvents,
  TimeGrid,
  TimeAxis,
  TimeLabels,
  DayColumns,
  TimeSlots,
  TimedEvents,
  NowMarker,
  MonthGrid,
  MonthWeekdays,
  MonthRows,
  MonthDays,
  MonthAllDayEvents,
  MonthTimedEvents,
  AgendaList,
  AgendaDays,
  AgendaAllDayEvents,
  AgendaTimedEvents
}

export const Calendar = {
  Root,
  Toolbar,
  Header,
  DayHeadings,
  AllDayRow,
  AllDayEvents,
  TimeGrid,
  TimeAxis,
  TimeLabels,
  DayColumns,
  TimeSlots,
  TimedEvents,
  NowMarker,
  MonthGrid,
  MonthWeekdays,
  MonthRows,
  MonthDays,
  MonthAllDayEvents,
  MonthTimedEvents,
  AgendaList,
  AgendaDays,
  AgendaAllDayEvents,
  AgendaTimedEvents
}

export type CalendarComponents<TData = unknown> = typeof Calendar & {
  readonly __type?: TData
}

export const createCalendarComponents = <
  TData = unknown
>(): CalendarComponents<TData> => Calendar

export type { ScopedSlot } from './types'

export type {
  AgendaAllDayEventScope,
  AgendaAllDayEventsProps
} from './agenda/agenda-all-day-events'
export type { AgendaDayScope, AgendaDaysProps } from './agenda/agenda-days'
export type { AgendaListProps } from './agenda/agenda-list'
export type {
  AgendaTimedEventScope,
  AgendaTimedEventsProps
} from './agenda/agenda-timed-events'
export type {
  MonthAllDayEventScope,
  MonthAllDayEventsProps
} from './month/month-all-day-events'
export type { MonthDayScope, MonthDaysProps } from './month/month-days'
export type { MonthGridProps } from './month/month-grid'
export type { MonthRowsProps, MonthRowScope } from './month/month-rows'
export type {
  MonthTimedEventScope,
  MonthTimedEventsProps
} from './month/month-timed-events'
export type {
  MonthWeekdayScope,
  MonthWeekdaysProps
} from './month/month-weekdays'
export type {
  AllDayEventScope,
  AllDayEventsProps
} from './shared/all-day-events'
export type { AllDayRowProps, AllDayScope } from './shared/all-day-row'
export type { DayHeadingScope, DayHeadingsProps } from './shared/day-headings'
export type { HeaderProps } from './shared/header'
export type { RootProps, RootScope } from './shared/root'
export type { ToolbarProps, ToolbarScope } from './shared/toolbar'
export type { DayColumnsProps, DayColumnScope } from './slotted/day-columns'
export type { NowMarkerProps, NowMarkerScope } from './slotted/now-marker'
export type { TimeAxisProps } from './slotted/time-axis'
export type { TimeGridProps, TimeGridScope } from './slotted/time-grid'
export type { TimeLabelScope, TimeLabelsProps } from './slotted/time-labels'
export type { TimeSlotScope, TimeSlotsProps } from './slotted/time-slots'
export type { TimedEventScope, TimedEventsProps } from './slotted/timed-events'
