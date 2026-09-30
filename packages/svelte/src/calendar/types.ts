import type {
  CalendarLayout,
  InvalidEventError,
  InvalidRangeError,
  InvalidRecurrenceError,
  MissingTemporalError
} from '../engine.js'

export type CalendarError =
  | InvalidEventError
  | InvalidRangeError
  | InvalidRecurrenceError
  | MissingTemporalError

export type CalendarResult<TData = unknown> =
  | { calendar: CalendarLayout<TData>; error: null }
  | { calendar: null; error: CalendarError }
