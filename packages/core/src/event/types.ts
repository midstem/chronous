import type {
  CalendarDate,
  Disambiguation,
  IsoDateTime,
  Moment,
  TimeZoneId
} from '#src/time'

export type EventId = string

export type EventInput<TData = unknown> = {
  id: EventId
  start: IsoDateTime
  end?: IsoDateTime
  duration?: string
  allDay?: boolean
  timeZone?: TimeZoneId
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
  data?: TData
}

export type AllDayEvent<TData = unknown> = {
  id: EventId
  allDay: true
  start: CalendarDate
  end: CalendarDate
  data?: TData
}

export type CalendarEvent<TData = unknown> =
  TimedEvent<TData> | AllDayEvent<TData>
