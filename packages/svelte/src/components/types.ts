import type {
  CalendarBar,
  CalendarBox,
  CalendarDay,
  CalendarEntry,
  CalendarRange,
  CalendarSlot,
  EventInput,
  IsoDate,
  LocaleId,
  TimedEntry,
  ViewKind
} from '../engine.js'
import type { Component, Snippet } from 'svelte'
import type {
  AgendaDayContextValue,
  AllDayContextValue,
  CalendarContextValue,
  DayColumnContextValue,
  MonthDayContextValue,
  MonthRowContextValue,
  TimeGridContextValue
} from './context'
import type { CalendarError } from '../calendar'
import type { CalendarNavigation } from '../navigation'

export type DayHeadingScope<T> = {
  day: CalendarDay<T>
  date: IsoDate
  weekdayLabel: string
  dayLabel: string
  inCurrentPeriod: boolean
}
export type AllDayEventScope<T> = {
  event: CalendarEntry<T>
  bar: CalendarBar<T>
}
export type TimeLabelScope = {
  slot: CalendarSlot
  minuteOfDay: number
  timeLabel: string
}
export type TimeSlotScope = { slot: CalendarSlot; minuteOfDay: number }
export type TimedEventScope<T> = { event: TimedEntry<T>; box: CalendarBox<T> }
export type NowMarkerScope = { minuteOfDay: number }
export type MonthDayScope<T> = MonthDayContextValue<T> & {
  dayLabel: string
  inCurrentPeriod: boolean
  lanes: number
}
export type MonthWeekdayScope<T> = { day: CalendarDay<T>; weekdayLabel: string }
export type MonthAllDayEventScope<T> = AllDayEventScope<T>
export type MonthTimedEventScope<T> = {
  event: TimedEntry<T>
  box: CalendarBox<T>
}
export type AgendaDayScope<T> = AgendaDayContextValue<T> & {
  weekdayLabel: string
  dayLabel: string
  monthLabel: string
}
export type AgendaAllDayEventScope<T> = AllDayEventScope<T>
export type AgendaTimedEventScope<T> = {
  event: TimedEntry<T>
  box: CalendarBox<T>
  timeRangeLabel: string
}
export type ToolbarScope = {
  navigation: CalendarNavigation
  range: CalendarRange
  title: string
  goTo: (range: CalendarRange) => void
}
export type ScopedChildren<TScope> = Snippet<[TScope]>
export type ElementProps<TScope = never> = {
  as?: keyof HTMLElementTagNameMap
  children?: [TScope] extends [never] ? Snippet : Snippet<[TScope]>
  style?: string | Record<string, string | number>
  [key: string]: unknown
}
export type RootProps<TData> = ElementProps<CalendarContextValue<TData>> & {
  range: CalendarRange
  events: readonly EventInput<TData>[]
  locale?: LocaleId
  gutterWidth?: string
  renderError?: Snippet<[CalendarError]>
}
export type ToolbarProps = ElementProps<ToolbarScope> & {
  onNavigate: (range: CalendarRange) => void
  views?: readonly ViewKind[]
}
export type HeaderProps<TData> = ElementProps<CalendarContextValue<TData>> & {
  gutterCell?: Snippet
}
export type DayHeadingsProps<TData> = ElementProps<DayHeadingScope<TData>>
export type AllDayRowProps<TData> = ElementProps<AllDayContextValue<TData>> & {
  laneHeight?: number
  minLanes?: number
  gutterCell?: Snippet
}
export type AllDayEventsProps<TData> = ElementProps<AllDayEventScope<TData>> & {
  gap?: number
}
export type TimeGridProps = ElementProps<TimeGridContextValue> & {
  hourHeight?: number
  scrollToHour?: number | null
}
export type TimeAxisProps = ElementProps<TimeGridContextValue>
export type TimeLabelsProps = ElementProps<TimeLabelScope>
export type DayColumnsProps<TData> = ElementProps<DayColumnContextValue<TData>>
export type TimeSlotsProps = ElementProps<TimeSlotScope>
export type TimedEventsProps<TData> = ElementProps<TimedEventScope<TData>> & {
  minHeight?: number
  gap?: number
}
export type NowMarkerProps = ElementProps<NowMarkerScope>
export type MonthGridProps<TData> = ElementProps<CalendarContextValue<TData>>
export type MonthWeekdaysProps<TData> = ElementProps<MonthWeekdayScope<TData>>
export type MonthRowsProps<TData> = ElementProps<
  MonthRowContextValue<TData>
> & { maxLanes?: number | null; laneHeight?: number }
export type MonthDaysProps<TData> = ElementProps<MonthDayScope<TData>>
export type MonthAllDayEventsProps<TData> = ElementProps<
  MonthAllDayEventScope<TData>
> & { gap?: number; lanesTopOffset?: number }
export type MonthTimedEventsProps<TData> = ElementProps<
  MonthTimedEventScope<TData>
>
export type AgendaListProps<TData> = ElementProps<CalendarContextValue<TData>>
export type AgendaDaysProps<TData> = ElementProps<AgendaDayScope<TData>> & {
  showEmptyDays?: boolean
}
export type AgendaAllDayEventsProps<TData> = ElementProps<
  AgendaAllDayEventScope<TData>
>
export type AgendaTimedEventsProps<TData> = ElementProps<
  AgendaTimedEventScope<TData>
>

export type CalendarComponents<TData> = {
  Root: Component<RootProps<TData>>
  Toolbar: Component<ToolbarProps>
  Header: Component<HeaderProps<TData>>
  DayHeadings: Component<DayHeadingsProps<TData>>
  AllDayRow: Component<AllDayRowProps<TData>>
  AllDayEvents: Component<AllDayEventsProps<TData>>
  TimeGrid: Component<TimeGridProps>
  TimeAxis: Component<TimeAxisProps>
  TimeLabels: Component<TimeLabelsProps>
  DayColumns: Component<DayColumnsProps<TData>>
  TimeSlots: Component<TimeSlotsProps>
  TimedEvents: Component<TimedEventsProps<TData>>
  NowMarker: Component<NowMarkerProps>
  MonthGrid: Component<MonthGridProps<TData>>
  MonthWeekdays: Component<MonthWeekdaysProps<TData>>
  MonthRows: Component<MonthRowsProps<TData>>
  MonthDays: Component<MonthDaysProps<TData>>
  MonthAllDayEvents: Component<MonthAllDayEventsProps<TData>>
  MonthTimedEvents: Component<MonthTimedEventsProps<TData>>
  AgendaList: Component<AgendaListProps<TData>>
  AgendaDays: Component<AgendaDaysProps<TData>>
  AgendaAllDayEvents: Component<AgendaAllDayEventsProps<TData>>
  AgendaTimedEvents: Component<AgendaTimedEventsProps<TData>>
}
