import {
  InvalidEventError,
  InvalidRangeError,
  InvalidRecurrenceError,
  buildCalendar
} from '@midstem/chronous'
import type { EventInput, CalendarRange } from '@midstem/chronous'

import type { CalendarError, CalendarResult } from './types'

const isCalendarError = (cause: unknown): cause is CalendarError =>
  cause instanceof InvalidEventError ||
  cause instanceof InvalidRangeError ||
  cause instanceof InvalidRecurrenceError

export const resultOf = <TData>(
  range: CalendarRange,
  events: readonly EventInput<TData>[]
): CalendarResult<TData> => {
  try {
    return { calendar: buildCalendar(range, events), error: null }
  } catch (cause) {
    if (!isCalendarError(cause)) throw cause

    return { calendar: null, error: cause }
  }
}
