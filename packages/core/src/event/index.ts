import { add, compare, withTimeZone } from '#src/time'
import type { CalendarDate, Moment, TimeZoneId } from '#src/time'

import {
  END_BEFORE_START_REASON,
  SINGLE_DAY,
  UNREADABLE_END_REASON,
  UNREADABLE_START_REASON
} from './constants'
import { InvalidEventError } from './errors'
import {
  atLeastOneDay,
  isAllDayInput,
  readCalendarDate,
  readDuration,
  readMoment
} from './helpers'
import type {
  AllDayEvent,
  CalendarEvent,
  EventInput,
  NormalizeContext,
  TimedEvent
} from './types'

const resolveTimedEnd = <TData>(
  input: EventInput<TData>,
  context: NormalizeContext,
  sourceZone: TimeZoneId,
  start: Moment
): Moment => {
  if (input.end !== undefined)
    return withTimeZone(
      readMoment(
        input.id,
        input.end,
        sourceZone,
        context.disambiguation,
        UNREADABLE_END_REASON
      ),
      context.timeZone
    )

  if (input.duration !== undefined)
    return add(start, readDuration(input.id, input.duration))

  return start
}

const resolveAllDayEnd = <TData>(
  input: EventInput<TData>,
  context: NormalizeContext,
  sourceZone: TimeZoneId,
  start: CalendarDate
): CalendarDate => {
  if (input.end !== undefined)
    return readCalendarDate(
      input.id,
      input.end,
      sourceZone,
      context.disambiguation,
      UNREADABLE_END_REASON
    )

  if (input.duration !== undefined)
    return add(start, readDuration(input.id, input.duration))

  return add(start, SINGLE_DAY)
}

const normalizeTimedEvent = <TData>(
  input: EventInput<TData>,
  context: NormalizeContext
): TimedEvent<TData> => {
  const sourceZone = input.timeZone ?? context.timeZone
  const start = withTimeZone(
    readMoment(
      input.id,
      input.start,
      sourceZone,
      context.disambiguation,
      UNREADABLE_START_REASON
    ),
    context.timeZone
  )
  const end = resolveTimedEnd(input, context, sourceZone, start)

  if (compare(end, start) < 0)
    throw new InvalidEventError(input.id, END_BEFORE_START_REASON)

  return {
    id: input.id,
    allDay: false,
    start,
    end,
    recurrence: input.recurrence,
    data: input.data
  }
}

const normalizeAllDayEvent = <TData>(
  input: EventInput<TData>,
  context: NormalizeContext
): AllDayEvent<TData> => {
  const sourceZone = input.timeZone ?? context.timeZone
  const start = readCalendarDate(
    input.id,
    input.start,
    sourceZone,
    context.disambiguation,
    UNREADABLE_START_REASON
  )
  const end = resolveAllDayEnd(input, context, sourceZone, start)

  if (compare(end, start) < 0)
    throw new InvalidEventError(input.id, END_BEFORE_START_REASON)

  return {
    id: input.id,
    allDay: true,
    start,
    end: atLeastOneDay(start, end),
    recurrence: input.recurrence,
    data: input.data
  }
}

export const isTimedEvent = <TData>(
  event: CalendarEvent<TData>
): event is TimedEvent<TData> => !event.allDay

export const isAllDayEvent = <TData>(
  event: CalendarEvent<TData>
): event is AllDayEvent<TData> => event.allDay

export const normalizeEvent = <TData>(
  input: EventInput<TData>,
  context: NormalizeContext
): CalendarEvent<TData> =>
  isAllDayInput(input)
    ? normalizeAllDayEvent(input, context)
    : normalizeTimedEvent(input, context)

export const normalizeEvents = <TData>(
  inputs: readonly EventInput<TData>[],
  context: NormalizeContext
): CalendarEvent<TData>[] =>
  inputs.map((input) => normalizeEvent(input, context))

export { InvalidEventError } from './errors'

export type * from './types'
