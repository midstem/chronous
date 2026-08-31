import type { ElementType, ReactNode } from 'react'

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

import type { AgendaAllDayEventsProps } from './agenda/agenda-all-day-events'
import type { AgendaDaysProps } from './agenda/agenda-days'
import type { AgendaListProps } from './agenda/agenda-list'
import type { AgendaTimedEventsProps } from './agenda/agenda-timed-events'
import type { MonthAllDayEventsProps } from './month/month-all-day-events'
import type { MonthDaysProps } from './month/month-days'
import type { MonthGridProps } from './month/month-grid'
import type { MonthRowsProps } from './month/month-rows'
import type { MonthTimedEventsProps } from './month/month-timed-events'
import type { MonthWeekdaysProps } from './month/month-weekdays'
import type { AllDayEventsProps } from './shared/all-day-events'
import type { AllDayRowProps } from './shared/all-day-row'
import type { DayHeadingsProps } from './shared/day-headings'
import type { HeaderProps } from './shared/header'
import type { RootProps } from './shared/root'
import type { ToolbarProps } from './shared/toolbar'
import type { DayColumnsProps } from './slotted/day-columns'
import type { NowMarkerProps } from './slotted/now-marker'
import type { TimeAxisProps } from './slotted/time-axis'
import type { TimeGridProps } from './slotted/time-grid'
import type { TimeLabelsProps } from './slotted/time-labels'
import type { TimeSlotsProps } from './slotted/time-slots'
import type { TimedEventsProps } from './slotted/timed-events'

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

export type CalendarComponents<TData> = {
  Root: <TTag extends ElementType = 'div'>(
    props: RootProps<TData, TTag>
  ) => ReactNode
  Toolbar: <TTag extends ElementType = 'div'>(
    props: ToolbarProps<TTag>
  ) => ReactNode
  Header: <TTag extends ElementType = 'div'>(
    props: HeaderProps<TData, TTag>
  ) => ReactNode
  DayHeadings: <TTag extends ElementType = 'div'>(
    props: DayHeadingsProps<TData, TTag>
  ) => ReactNode
  AllDayRow: <TTag extends ElementType = 'div'>(
    props: AllDayRowProps<TData, TTag>
  ) => ReactNode
  AllDayEvents: <TTag extends ElementType = 'div'>(
    props: AllDayEventsProps<TData, TTag>
  ) => ReactNode
  TimeGrid: <TTag extends ElementType = 'div'>(
    props: TimeGridProps<TTag>
  ) => ReactNode
  TimeAxis: <TTag extends ElementType = 'div'>(
    props: TimeAxisProps<TTag>
  ) => ReactNode
  TimeLabels: <TTag extends ElementType = 'div'>(
    props: TimeLabelsProps<TTag>
  ) => ReactNode
  DayColumns: <TTag extends ElementType = 'div'>(
    props: DayColumnsProps<TData, TTag>
  ) => ReactNode
  TimeSlots: <TTag extends ElementType = 'span'>(
    props: TimeSlotsProps<TTag>
  ) => ReactNode
  TimedEvents: <TTag extends ElementType = 'div'>(
    props: TimedEventsProps<TData, TTag>
  ) => ReactNode
  NowMarker: <TTag extends ElementType = 'div'>(
    props: NowMarkerProps<TTag>
  ) => ReactNode
  MonthGrid: <TTag extends ElementType = 'div'>(
    props: MonthGridProps<TData, TTag>
  ) => ReactNode
  MonthWeekdays: <TTag extends ElementType = 'div'>(
    props: MonthWeekdaysProps<TData, TTag>
  ) => ReactNode
  MonthRows: <TTag extends ElementType = 'div'>(
    props: MonthRowsProps<TData, TTag>
  ) => ReactNode
  MonthDays: <TTag extends ElementType = 'div'>(
    props: MonthDaysProps<TData, TTag>
  ) => ReactNode
  MonthAllDayEvents: <TTag extends ElementType = 'div'>(
    props: MonthAllDayEventsProps<TData, TTag>
  ) => ReactNode
  MonthTimedEvents: <TTag extends ElementType = 'div'>(
    props: MonthTimedEventsProps<TData, TTag>
  ) => ReactNode
  AgendaList: <TTag extends ElementType = 'div'>(
    props: AgendaListProps<TData, TTag>
  ) => ReactNode
  AgendaDays: <TTag extends ElementType = 'div'>(
    props: AgendaDaysProps<TData, TTag>
  ) => ReactNode
  AgendaAllDayEvents: <TTag extends ElementType = 'div'>(
    props: AgendaAllDayEventsProps<TData, TTag>
  ) => ReactNode
  AgendaTimedEvents: <TTag extends ElementType = 'div'>(
    props: AgendaTimedEventsProps<TData, TTag>
  ) => ReactNode
}

export const createCalendarComponents = <TData>(): CalendarComponents<TData> =>
  Calendar

export type { ScopedChildren } from './types'

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
export type { MonthRowsProps } from './month/month-rows'
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
export type { AllDayRowProps } from './shared/all-day-row'
export type { DayHeadingScope, DayHeadingsProps } from './shared/day-headings'
export type { HeaderProps } from './shared/header'
export type { RootProps } from './shared/root'
export type { ToolbarProps, ToolbarScope } from './shared/toolbar'
export type { DayColumnsProps } from './slotted/day-columns'
export type { NowMarkerProps, NowMarkerScope } from './slotted/now-marker'
export type { TimeAxisProps } from './slotted/time-axis'
export type { TimeGridProps } from './slotted/time-grid'
export type { TimeLabelScope, TimeLabelsProps } from './slotted/time-labels'
export type { TimeSlotScope, TimeSlotsProps } from './slotted/time-slots'
export type { TimedEventScope, TimedEventsProps } from './slotted/timed-events'
