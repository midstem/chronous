import type { EventId } from '#src/event'
import type { IsoDate, IsoDateTime } from '#src/time'

import type { CalendarSlot } from '../types'

export type FallbackDay = {
  date: IsoDate
  startEpoch: number
  endEpoch: number
  startIso: IsoDateTime
  endIso: IsoDateTime
  minutes: number
  inCurrentPeriod: boolean
  slots: CalendarSlot[]
}

export type FallbackTimedEvent<TData = unknown> = {
  id: EventId
  allDay: false
  startEpoch: number
  endEpoch: number
  startIso: IsoDateTime
  endIso: IsoDateTime
  seriesId?: EventId
  recurrenceId?: IsoDateTime
  data?: TData
}

export type FallbackAllDayEvent<TData = unknown> = {
  id: EventId
  allDay: true
  start: IsoDate
  end: IsoDate
  seriesId?: EventId
  recurrenceId?: IsoDateTime
  data?: TData
}

export type FallbackEvent<TData = unknown> =
  FallbackTimedEvent<TData> | FallbackAllDayEvent<TData>
