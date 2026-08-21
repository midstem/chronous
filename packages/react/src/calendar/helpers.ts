import {
  InvalidEventError,
  InvalidRangeError,
  buildCalendar
} from '@midstem/chronous'
import type { EventInput, RangeSpec } from '@midstem/chronous'

import type { CalendarError, CalendarResult } from './types'

const isCalendarError = (cause: unknown): cause is CalendarError =>
  cause instanceof InvalidEventError || cause instanceof InvalidRangeError

export const resultOf = <TData>(
  spec: RangeSpec,
  events: readonly EventInput<TData>[]
): CalendarResult<TData> => {
  try {
    return { calendar: buildCalendar(spec, events), error: null }
  } catch (cause) {
    if (!isCalendarError(cause)) throw cause

    return { calendar: null, error: cause }
  }
}
