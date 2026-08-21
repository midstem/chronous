import type {
  Calendar,
  InvalidEventError,
  InvalidRangeError
} from '@midstem/chronous'

export type CalendarError = InvalidEventError | InvalidRangeError

export type CalendarResult<TData = unknown> =
  | { calendar: Calendar<TData>; error: null }
  | { calendar: null; error: CalendarError }
