import type { CalendarEvent } from '#src/event'
import type { CalendarDate, Moment } from '#src/time'

export type PlacedSpan<TData = unknown> = {
  event: CalendarEvent<TData>
  start: CalendarDate
  end: CalendarDate
  startDay: number
  endDay: number
  dayCount: number
  lane: number
  lanes: number
  left: number
  width: number
  continuesBefore: boolean
  continuesAfter: boolean
}

export type LaneSpan<TData = unknown> = Omit<
  PlacedSpan<TData>,
  'lane' | 'lanes'
>

export type LaneStack<TData = unknown> = {
  lanes: number
  spans: PlacedSpan<TData>[]
}

export type EventBounds<TData = unknown> = {
  event: CalendarEvent<TData>
  start: Moment
  end: Moment
}

export type LaneRow<TData = unknown> = {
  start: CalendarDate
  end: CalendarDate
  dayCount: number
  lanes: number
  spans: PlacedSpan<TData>[]
}

export type DayStarts = (date: CalendarDate) => Moment
