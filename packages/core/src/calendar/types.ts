import type { EventId } from '#src/event'
import type { ViewKind } from '#src/range'
import type { IsoDate, IsoDateTime } from '#src/time'

export type TimedEntry<TData = unknown> = {
  id: EventId
  allDay: false
  start: IsoDateTime
  end: IsoDateTime
  seriesId?: EventId
  recurrenceId?: IsoDateTime
  data?: TData
}

export type AllDayEntry<TData = unknown> = {
  id: EventId
  allDay: true
  start: IsoDate
  end: IsoDate
  seriesId?: EventId
  recurrenceId?: IsoDateTime
  data?: TData
}

export type CalendarEntry<TData = unknown> =
  TimedEntry<TData> | AllDayEntry<TData>

export type CalendarSlot = {
  minuteOfDay: number
  start: IsoDateTime
  end: IsoDateTime
  minutes: number
}

export type CalendarBox<TData = unknown> = {
  event: TimedEntry<TData>
  start: IsoDateTime
  end: IsoDateTime
  startMinute: number
  endMinute: number
  minutes: number
  top: number
  height: number
  left: number
  width: number
  column: number
  columns: number
  span: number
  continuesBefore: boolean
  continuesAfter: boolean
}

export type CalendarBar<TData = unknown> = {
  event: CalendarEntry<TData>
  start: IsoDate
  end: IsoDate
  startDay: number
  endDay: number
  days: number
  lane: number
  lanes: number
  left: number
  width: number
  continuesBefore: boolean
  continuesAfter: boolean
}

export type CalendarDay<TData = unknown> = {
  date: IsoDate
  start: IsoDateTime
  end: IsoDateTime
  minutes: number
  inPeriod: boolean
  slots: CalendarSlot[]
  boxes: CalendarBox<TData>[]
}

export type CalendarRow<TData = unknown> = {
  start: IsoDate
  end: IsoDate
  days: number
  lanes: number
  bars: CalendarBar<TData>[]
}

export type Calendar<TData = unknown> = {
  view: ViewKind
  start: IsoDateTime
  end: IsoDateTime
  days: CalendarDay<TData>[]
  rows: CalendarRow<TData>[]
}
