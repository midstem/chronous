import { InvalidEventError } from '#src/event'
import type { EventInput } from '#src/event'
import { InvalidRecurrenceError } from '#src/recurrence'

import {
  addDaysToDate,
  getZonedParts,
  isDateOnlyString,
  parseDateOnly,
  parseFixedTimedIso
} from './time'
import type { FallbackEvent } from './types'

const END_BEFORE_START_REASON = 'ends before it starts'
const UNREADABLE_START_REASON = 'has an unreadable start'
const UNREADABLE_END_REASON = 'has an unreadable end'

export const normalizeFallbackEvent = <TData>(
  input: EventInput<TData>,
  timeZone: string
): FallbackEvent<TData> => {
  if (
    input.id === undefined ||
    input.id === null ||
    typeof input.id !== 'string' ||
    input.id.length === 0
  ) {
    throw new InvalidEventError(input.id ?? '', 'has an invalid id')
  }

  if (input.recurrence !== undefined) {
    throw new InvalidRecurrenceError(
      input.id,
      'is not supported in date fallback mode'
    )
  }

  if (input.duration !== undefined) {
    throw new InvalidEventError(
      input.id,
      'duration is not supported in date fallback mode'
    )
  }

  const isAllDay =
    input.allDay !== undefined
      ? input.allDay
      : isDateOnlyString(input.start) &&
        (input.end === undefined || isDateOnlyString(input.end))

  if (isAllDay) {
    if (!isDateOnlyString(input.start)) {
      throw new InvalidEventError(
        input.id,
        'all-day events must be date-only in date fallback mode'
      )
    }

    parseDateOnly(
      input.start,
      (cause) => new InvalidEventError(input.id, UNREADABLE_START_REASON, cause)
    )

    let end: string
    if (input.end !== undefined) {
      if (!isDateOnlyString(input.end)) {
        throw new InvalidEventError(
          input.id,
          UNREADABLE_END_REASON,
          new RangeError(`Invalid all-day end date: "${input.end}"`)
        )
      }
      parseDateOnly(
        input.end,
        (cause) => new InvalidEventError(input.id, UNREADABLE_END_REASON, cause)
      )

      if (input.end < input.start) {
        throw new InvalidEventError(input.id, END_BEFORE_START_REASON)
      }

      end =
        input.end === input.start ? addDaysToDate(input.start, 1) : input.end
    } else {
      end = addDaysToDate(input.start, 1)
    }

    return {
      id: input.id,
      allDay: true,
      start: input.start,
      end,
      data: input.data
    }
  }

  if (isDateOnlyString(input.start)) {
    throw new InvalidEventError(
      input.id,
      'floating times are not supported in date fallback mode'
    )
  }

  const startEpoch = parseFixedTimedIso(
    input.id,
    input.start,
    UNREADABLE_START_REASON
  )

  let endEpoch: number
  if (input.end !== undefined) {
    if (isDateOnlyString(input.end)) {
      throw new InvalidEventError(
        input.id,
        UNREADABLE_END_REASON,
        new RangeError('End of timed event cannot be date-only')
      )
    }
    endEpoch = parseFixedTimedIso(input.id, input.end, UNREADABLE_END_REASON)
    if (endEpoch < startEpoch) {
      throw new InvalidEventError(input.id, END_BEFORE_START_REASON)
    }
  } else {
    endEpoch = startEpoch
  }

  const startIso = getZonedParts(startEpoch, timeZone).isoString
  const endIso = getZonedParts(endEpoch, timeZone).isoString

  return {
    id: input.id,
    allDay: false,
    startEpoch,
    endEpoch,
    startIso,
    endIso,
    data: input.data
  }
}
