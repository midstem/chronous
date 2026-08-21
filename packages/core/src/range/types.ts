import type {
  CalendarDate,
  Disambiguation,
  IsoDate,
  Moment,
  TimeZoneId,
  WeekStartsOn
} from '#src/time'

export type ViewKind = 'day' | 'week' | 'days' | 'month' | 'agenda'

export type RangeSpec = {
  view: ViewKind
  date: IsoDate
  timeZone: TimeZoneId
  weekStartsOn?: WeekStartsOn
  dayCount?: number
  slotMinutes?: number
  disambiguation?: Disambiguation
}

export type ResolvedSpec = {
  timeZone: TimeZoneId
  weekStartsOn: WeekStartsOn
  disambiguation?: Disambiguation
  slotMinutes: number
  slotted: boolean
}

export type DaySlot = {
  minuteOfDay: number
  start: Moment
  end: Moment
  minutes: number
}

export type RangeDay = {
  date: CalendarDate
  start: Moment
  end: Moment
  minutes: number
  inPeriod: boolean
  slots: DaySlot[]
}

export type DateRange = {
  view: ViewKind
  start: Moment
  end: Moment
  days: RangeDay[]
}
