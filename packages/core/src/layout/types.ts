import type { TimedEvent } from '#src/event'
import type { CalendarDate, Moment } from '#src/time'

export type PlacedEvent<TData = unknown> = {
  event: TimedEvent<TData>
  start: Moment
  end: Moment
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

export type Segment<TData = unknown> = Omit<
  PlacedEvent<TData>,
  'column' | 'columns' | 'span' | 'left' | 'width'
>

export type DayLayout<TData = unknown> = {
  date: CalendarDate
  events: PlacedEvent<TData>[]
}

export type RangeLayout<TData = unknown> = {
  days: DayLayout<TData>[]
}
