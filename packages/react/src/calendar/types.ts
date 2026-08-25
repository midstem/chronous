import type {
  Calendar,
  InvalidEventError,
  InvalidRangeError,
  InvalidRecurrenceError
} from '@midstem/chronous'

export type CalendarError =
  InvalidEventError | InvalidRangeError | InvalidRecurrenceError

export type CalendarResult<TData = unknown> =
  | { calendar: Calendar<TData>; error: null }
  | { calendar: null; error: CalendarError }
