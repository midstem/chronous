import { Root } from './shared/root'
import { Header } from './shared/header'
import { DayHeadings } from './shared/day-headings'
import { AllDayRow } from './shared/all-day-row'
import { AllDayEvents } from './shared/all-day-events'
import { Toolbar } from './shared/toolbar'

import { TimeGrid } from './slotted/time-grid'
import { TimeLabels } from './slotted/time-labels'
import { DayColumns } from './slotted/day-columns'
import { TimeSlots } from './slotted/time-slots'
import { TimedEvents } from './slotted/timed-events'
import { NowMarker } from './slotted/now-marker'

import { MonthGrid } from './month/month-grid'
import { MonthRows } from './month/month-rows'
import { MonthDays } from './month/month-days'
import { MonthBars } from './month/month-bars'
import { MonthDots } from './month/month-dots'

import { AgendaList } from './agenda/agenda-list'
import { AgendaDays } from './agenda/agenda-days'
import { AgendaBars } from './agenda/agenda-bars'
import { AgendaBoxes } from './agenda/agenda-boxes'

export const Calendar = {
  // Shared
  Root,
  Header,
  DayHeadings,
  AllDayRow,
  AllDayEvents,
  Toolbar,

  // Slotted view (day / week / days)
  TimeGrid,
  TimeLabels,
  DayColumns,
  TimeSlots,
  TimedEvents,
  NowMarker,

  // Month view
  MonthGrid,
  MonthRows,
  MonthDays,
  MonthBars,
  MonthDots,

  // Agenda view
  AgendaList,
  AgendaDays,
  AgendaBars,
  AgendaBoxes
}
