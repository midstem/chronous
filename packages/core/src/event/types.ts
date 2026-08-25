import type {
  CalendarDate,
  Disambiguation,
  IsoDateTime,
  Moment,
  TimeZoneId
} from '#src/time'

export type EventId = string

export type RecurrenceOverride<TData = unknown> = {
  recurrenceId: IsoDateTime
  cancelled?: boolean
  start?: IsoDateTime
  end?: IsoDateTime
  duration?: string
  data?: TData
}

export type RecurrenceInput<TData = unknown> = {
  rule?: string
  dates?: IsoDateTime[]
  exceptions?: IsoDateTime[]
  overrides?: RecurrenceOverride<TData>[]
}

export type EventInput<TData = unknown> = {
  id: EventId
  start: IsoDateTime
  end?: IsoDateTime
  duration?: string
  allDay?: boolean
  timeZone?: TimeZoneId
  recurrence?: RecurrenceInput<TData>
  data?: TData
}

export type NormalizeContext = {
  timeZone: TimeZoneId
  disambiguation?: Disambiguation
}

export type TimedEvent<TData = unknown> = {
  id: EventId
  allDay: false
  start: Moment
  end: Moment
  seriesId?: EventId
  recurrenceId?: IsoDateTime
  recurrence?: RecurrenceInput<TData>
  data?: TData
}

export type AllDayEvent<TData = unknown> = {
  id: EventId
  allDay: true
  start: CalendarDate
  end: CalendarDate
  seriesId?: EventId
  recurrenceId?: IsoDateTime
  recurrence?: RecurrenceInput<TData>
  data?: TData
}

export type CalendarEvent<TData = unknown> =
  TimedEvent<TData> | AllDayEvent<TData>
