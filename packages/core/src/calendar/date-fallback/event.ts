import { InvalidEventError } from '#src/event'
import type { EventInput } from '#src/event'

import {
  addDaysToDate,
  getZonedParts,
  isDateOnlyString,
  parseDateOnly,
  parseTimedIso
} from './time'
import type { FallbackEvent } from './types'
import { warnApproximation } from './warn'

const END_BEFORE_START_REASON = 'ends before it starts'
const UNREADABLE_START_REASON = 'has an unreadable start'
const UNREADABLE_END_REASON = 'has an unreadable end'

const DURATION_PATTERN =
  /^P(?:(\d+(?:[.,]\d+)?)Y)?(?:(\d+(?:[.,]\d+)?)M)?(?:(\d+(?:[.,]\d+)?)W)?(?:(\d+(?:[.,]\d+)?)D)?(?:T(?:(\d+(?:[.,]\d+)?)H)?(?:(\d+(?:[.,]\d+)?)M)?(?:(\d+(?:[.,]\d+)?)S)?)?$/i

const durationParts = (eventId: string, value: string): number[] => {
  const match = DURATION_PATTERN.exec(value)
  if (!match || match.slice(1).every((part) => part === undefined))
    throw new InvalidEventError(eventId, 'has an unreadable duration')
  return match.slice(1).map((part) => Number((part ?? '0').replace(',', '.')))
}

const durationDays = (eventId: string, value: string): number => {
  const [years, months, weeks, days, hours, minutes, seconds] = durationParts(
    eventId,
    value
  )
  if (hours || minutes || seconds)
    warnApproximation(
      `duration-time:${eventId}`,
      `Time units in the all-day duration of event "${eventId}" are ignored in Date fallback.`
    )
  if (years || months)
    warnApproximation(
      `duration:${eventId}`,
      `Calendar months and years for event "${eventId}" use approximate lengths in Date fallback.`
    )
  return years * 365 + months * 30 + weeks * 7 + days
}

const durationMilliseconds = (eventId: string, value: string): number => {
  const [years, months, weeks, days, hours, minutes, seconds] = durationParts(
    eventId,
    value
  )
  if (years || months || weeks || days)
    warnApproximation(
      `duration:${eventId}`,
      `Calendar units in the duration of event "${eventId}" use approximate elapsed time in Date fallback.`
    )
  return (
    ((((years * 365 + months * 30 + weeks * 7 + days) * 24 + hours) * 60 +
      minutes) *
      60 +
      seconds) *
    1000
  )
}

export const normalizeFallbackEvent = <TData>(
  input: EventInput<TData>,
  timeZone: string
): FallbackEvent<TData> => {
  if (
    input.id === undefined ||
    input.id === null ||
    typeof input.id !== 'string'
  ) {
    throw new InvalidEventError(input.id ?? '', 'has an invalid id')
  }

  const isAllDay =
    input.allDay !== undefined
      ? input.allDay
      : isDateOnlyString(input.start) &&
        (input.end === undefined || isDateOnlyString(input.end))

  if (isAllDay) {
    const sourceZone = input.timeZone ?? timeZone
    const start = isDateOnlyString(input.start)
      ? input.start
      : getZonedParts(
          parseTimedIso(
            input.id,
            input.start,
            sourceZone,
            UNREADABLE_START_REASON
          ),
          sourceZone
        ).dateString
    parseDateOnly(
      start,
      (cause) => new InvalidEventError(input.id, UNREADABLE_START_REASON, cause)
    )

    let end: string
    if (input.end !== undefined) {
      const parsedEnd = isDateOnlyString(input.end)
        ? input.end
        : getZonedParts(
            parseTimedIso(
              input.id,
              input.end,
              sourceZone,
              UNREADABLE_END_REASON
            ),
            sourceZone
          ).dateString
      parseDateOnly(
        parsedEnd,
        (cause) => new InvalidEventError(input.id, UNREADABLE_END_REASON, cause)
      )

      if (parsedEnd < start) {
        throw new InvalidEventError(input.id, END_BEFORE_START_REASON)
      }

      end = parsedEnd === start ? addDaysToDate(start, 1) : parsedEnd
    } else if (input.duration !== undefined) {
      end = addDaysToDate(start, durationDays(input.id, input.duration))
    } else {
      end = addDaysToDate(start, 1)
    }

    if (end === start) end = addDaysToDate(start, 1)

    return {
      id: input.id,
      allDay: true,
      start,
      end,
      data: input.data
    }
  }

  const sourceZone = input.timeZone ?? timeZone
  const startEpoch = parseTimedIso(
    input.id,
    input.start,
    sourceZone,
    UNREADABLE_START_REASON
  )

  let endEpoch: number
  if (input.end !== undefined) {
    endEpoch = parseTimedIso(
      input.id,
      input.end,
      sourceZone,
      UNREADABLE_END_REASON
    )
    if (endEpoch < startEpoch) {
      throw new InvalidEventError(input.id, END_BEFORE_START_REASON)
    }
  } else if (input.duration !== undefined) {
    endEpoch = startEpoch + durationMilliseconds(input.id, input.duration)
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
