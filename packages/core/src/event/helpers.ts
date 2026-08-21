import {
  add,
  compare,
  duration,
  isDateOnly,
  plainDate,
  toCalendarDate,
  zoned
} from '#src/time'
import type {
  CalendarDate,
  Disambiguation,
  IsoDateTime,
  Moment,
  TimeSpan,
  TimeZoneId
} from '#src/time'

import { SINGLE_DAY, UNREADABLE_DURATION_REASON } from './constants'
import { InvalidEventError } from './errors'
import type { EventId, EventInput } from './types'

export const isAllDayInput = (input: EventInput): boolean => {
  if (input.allDay !== undefined) return input.allDay

  return (
    isDateOnly(input.start) &&
    (input.end === undefined || isDateOnly(input.end))
  )
}

export const readMoment = (
  id: EventId,
  iso: IsoDateTime,
  timeZone: TimeZoneId,
  disambiguation: Disambiguation | undefined,
  reason: string
): Moment => {
  try {
    return zoned(iso, timeZone, disambiguation)
  } catch (cause) {
    throw new InvalidEventError(id, reason, cause)
  }
}

export const readCalendarDate = (
  id: EventId,
  iso: IsoDateTime,
  timeZone: TimeZoneId,
  disambiguation: Disambiguation | undefined,
  reason: string
): CalendarDate => {
  if (isDateOnly(iso)) {
    try {
      return plainDate(iso)
    } catch (cause) {
      throw new InvalidEventError(id, reason, cause)
    }
  }

  return toCalendarDate(readMoment(id, iso, timeZone, disambiguation, reason))
}

export const readDuration = (id: EventId, input: string): TimeSpan => {
  try {
    return duration(input)
  } catch (cause) {
    throw new InvalidEventError(id, UNREADABLE_DURATION_REASON, cause)
  }
}

export const atLeastOneDay = (
  start: CalendarDate,
  end: CalendarDate
): CalendarDate => (compare(end, start) === 0 ? add(start, SINGLE_DAY) : end)
