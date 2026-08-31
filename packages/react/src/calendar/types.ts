import type {
  CalendarLayout,
  InvalidEventError,
  InvalidRangeError,
  InvalidRecurrenceError
} from '@midstem/chronous'

export type CalendarError =
  InvalidEventError | InvalidRangeError | InvalidRecurrenceError

export type CalendarResult<TData = unknown> =
  | { calendar: CalendarLayout<TData>; error: null }
  | { calendar: null; error: CalendarError }
