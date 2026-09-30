import type { Component } from 'svelte'
import Root from './shared/Root.svelte'
import Toolbar from './shared/Toolbar.svelte'
import Header from './shared/Header.svelte'
import DayHeadings from './shared/DayHeadings.svelte'
import AllDayRow from './shared/AllDayRow.svelte'
import AllDayEvents from './shared/AllDayEvents.svelte'
import TimeGrid from './slotted/TimeGrid.svelte'
import TimeAxis from './slotted/TimeAxis.svelte'
import TimeLabels from './slotted/TimeLabels.svelte'
import DayColumns from './slotted/DayColumns.svelte'
import TimeSlots from './slotted/TimeSlots.svelte'
import TimedEvents from './slotted/TimedEvents.svelte'
import NowMarker from './slotted/NowMarker.svelte'
import MonthGrid from './month/MonthGrid.svelte'
import MonthWeekdays from './month/MonthWeekdays.svelte'
import MonthRows from './month/MonthRows.svelte'
import MonthDays from './month/MonthDays.svelte'
import MonthAllDayEvents from './month/MonthAllDayEvents.svelte'
import MonthTimedEvents from './month/MonthTimedEvents.svelte'
import AgendaList from './agenda/AgendaList.svelte'
import AgendaDays from './agenda/AgendaDays.svelte'
import AgendaAllDayEvents from './agenda/AgendaAllDayEvents.svelte'
import AgendaTimedEvents from './agenda/AgendaTimedEvents.svelte'
import type { CalendarComponents } from './types'

const components = {
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
export const Calendar = components as unknown as CalendarComponents<unknown>

/** Return typed component references for event payloads used by a calendar instance. */
export const createCalendarComponents = <
  TData
>(): CalendarComponents<TData> => {
  const components = Calendar as unknown as Record<
    keyof CalendarComponents<TData>,
    Component<any>
  >
  return components as CalendarComponents<TData>
}

export type * from './types'
