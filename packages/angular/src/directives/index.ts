import { AgendaAllDayEventsDirective } from './agenda/agenda-all-day-events'
import { AgendaDaysDirective } from './agenda/agenda-days'
import { AgendaListDirective } from './agenda/agenda-list'
import { AgendaTimedEventsDirective } from './agenda/agenda-timed-events'
import { MonthAllDayEventsDirective } from './month/month-all-day-events'
import { MonthDaysDirective } from './month/month-days'
import { MonthGridDirective } from './month/month-grid'
import { MonthRowsDirective } from './month/month-rows'
import { MonthTimedEventsDirective } from './month/month-timed-events'
import { MonthWeekdaysDirective } from './month/month-weekdays'
import { AllDayEventsDirective } from './shared/all-day-events'
import { AllDayRowComponent } from './shared/all-day-row'
import { CalendarDirective } from './shared/calendar'
import { DayHeadingsDirective } from './shared/day-headings'
import { HeaderDirective } from './shared/header'
import { ToolbarDirective } from './shared/toolbar'
import { DayColumnsDirective } from './slotted/day-columns'
import { NowMarkerDirective } from './slotted/now-marker'
import { TimeAxisDirective } from './slotted/time-axis'
import { TimeGridComponent } from './slotted/time-grid'
import { TimeLabelsDirective } from './slotted/time-labels'
import { TimeSlotsDirective } from './slotted/time-slots'
import { TimedEventsDirective } from './slotted/timed-events'

export const CALENDAR_DIRECTIVES = [
  CalendarDirective,
  ToolbarDirective,
  HeaderDirective,
  DayHeadingsDirective,
  AllDayRowComponent,
  AllDayEventsDirective,
  TimeGridComponent,
  TimeAxisDirective,
  TimeLabelsDirective,
  DayColumnsDirective,
  TimeSlotsDirective,
  TimedEventsDirective,
  NowMarkerDirective,
  MonthGridDirective,
  MonthWeekdaysDirective,
  MonthRowsDirective,
  MonthDaysDirective,
  MonthAllDayEventsDirective,
  MonthTimedEventsDirective,
  AgendaListDirective,
  AgendaDaysDirective,
  AgendaAllDayEventsDirective,
  AgendaTimedEventsDirective
] as const

export {
  AgendaAllDayEventsDirective,
  AgendaDaysDirective,
  AgendaListDirective,
  AgendaTimedEventsDirective,
  AllDayEventsDirective,
  AllDayRowComponent,
  CalendarDirective,
  DayColumnsDirective,
  DayHeadingsDirective,
  HeaderDirective,
  MonthAllDayEventsDirective,
  MonthDaysDirective,
  MonthGridDirective,
  MonthRowsDirective,
  MonthTimedEventsDirective,
  MonthWeekdaysDirective,
  NowMarkerDirective,
  TimeAxisDirective,
  TimeGridComponent,
  TimeLabelsDirective,
  TimeSlotsDirective,
  TimedEventsDirective,
  ToolbarDirective
}

export type { ScopedContext } from './types'

export type {
  AgendaAllDayEventContext,
  AgendaAllDayEventScope
} from './agenda/agenda-all-day-events'
export type { AgendaDayContext, AgendaDayScope } from './agenda/agenda-days'
export type {
  AgendaTimedEventContext,
  AgendaTimedEventScope
} from './agenda/agenda-timed-events'
export type {
  MonthAllDayEventContext,
  MonthAllDayEventScope
} from './month/month-all-day-events'
export type { MonthDayContext, MonthDayScope } from './month/month-days'
export type { MonthRowContext, MonthRowScope } from './month/month-rows'
export type {
  MonthTimedEventContext,
  MonthTimedEventScope
} from './month/month-timed-events'
export type {
  MonthWeekdayContext,
  MonthWeekdayScope
} from './month/month-weekdays'
export type {
  AllDayEventContext,
  AllDayEventScope
} from './shared/all-day-events'
export type {
  CalendarErrorContext,
  CalendarScope,
  CalendarTemplateContext
} from './shared/calendar'
export type { DayHeadingContext, DayHeadingScope } from './shared/day-headings'
export type { ToolbarContext, ToolbarScope } from './shared/toolbar'
export type { DayColumnContext, DayColumnScope } from './slotted/day-columns'
export type { NowMarkerContext, NowMarkerScope } from './slotted/now-marker'
export type { TimeLabelContext, TimeLabelScope } from './slotted/time-labels'
export type { TimeSlotContext, TimeSlotScope } from './slotted/time-slots'
export type { TimedEventContext, TimedEventScope } from './slotted/timed-events'
