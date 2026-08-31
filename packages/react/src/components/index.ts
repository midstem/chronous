import type { ElementType, ReactNode } from 'react'

import { AgendaBars } from './agenda/agenda-bars'
import { AgendaBoxes } from './agenda/agenda-boxes'
import { AgendaDays } from './agenda/agenda-days'
import { AgendaList } from './agenda/agenda-list'
import { MonthBars } from './month/month-bars'
import { MonthDays } from './month/month-days'
import { MonthEntries } from './month/month-entries'
import { MonthGrid } from './month/month-grid'
import { MonthRows } from './month/month-rows'
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

import type { AgendaBarsProps } from './agenda/agenda-bars'
import type { AgendaBoxesProps } from './agenda/agenda-boxes'
import type { AgendaDaysProps } from './agenda/agenda-days'
import type { AgendaListProps } from './agenda/agenda-list'
import type { MonthBarsProps } from './month/month-bars'
import type { MonthDaysProps } from './month/month-days'
import type { MonthEntriesProps } from './month/month-entries'
import type { MonthGridProps } from './month/month-grid'
import type { MonthRowsProps } from './month/month-rows'
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
  MonthBars,
  MonthEntries,
  AgendaList,
  AgendaDays,
  AgendaBars,
  AgendaBoxes
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
  MonthBars: <TTag extends ElementType = 'div'>(
    props: MonthBarsProps<TData, TTag>
  ) => ReactNode
  MonthEntries: <TTag extends ElementType = 'div'>(
    props: MonthEntriesProps<TData, TTag>
  ) => ReactNode
  AgendaList: <TTag extends ElementType = 'div'>(
    props: AgendaListProps<TData, TTag>
  ) => ReactNode
  AgendaDays: <TTag extends ElementType = 'div'>(
    props: AgendaDaysProps<TData, TTag>
  ) => ReactNode
  AgendaBars: <TTag extends ElementType = 'div'>(
    props: AgendaBarsProps<TData, TTag>
  ) => ReactNode
  AgendaBoxes: <TTag extends ElementType = 'div'>(
    props: AgendaBoxesProps<TData, TTag>
  ) => ReactNode
}

export const createCalendar = <TData>(): CalendarComponents<TData> => Calendar

export type * from './types'

export type { AgendaBarScope, AgendaBarsProps } from './agenda/agenda-bars'
export type { AgendaBoxScope, AgendaBoxesProps } from './agenda/agenda-boxes'
export type { AgendaDayScope, AgendaDaysProps } from './agenda/agenda-days'
export type { AgendaListProps } from './agenda/agenda-list'
export type { MonthBarScope, MonthBarsProps } from './month/month-bars'
export type { MonthDayScope, MonthDaysProps } from './month/month-days'
export type { MonthEntriesProps, MonthEntryScope } from './month/month-entries'
export type { MonthGridProps } from './month/month-grid'
export type { MonthRowsProps } from './month/month-rows'
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
