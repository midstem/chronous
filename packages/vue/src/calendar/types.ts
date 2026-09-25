import type {
  CalendarLayout,
  InvalidEventError,
  InvalidRangeError,
  InvalidRecurrenceError,
  MissingTemporalError
} from '@midstem/chronous'
import type { ComputedRef } from 'vue'

export type CalendarError =
  | InvalidEventError
  | InvalidRangeError
  | InvalidRecurrenceError
  | MissingTemporalError

export type CalendarResultValue<TData = unknown> =
  | { calendar: CalendarLayout<TData>; error: null }
  | { calendar: null; error: CalendarError }

export type CalendarResult<TData = unknown> = {
  readonly calendar: ComputedRef<CalendarLayout<TData> | null>
  readonly error: ComputedRef<CalendarError | null>
}
