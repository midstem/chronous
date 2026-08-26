import { isAllDayEvent, normalizeEvent } from '#src/event'
import type {
  AllDayEvent,
  CalendarEvent,
  EventId,
  NormalizeContext,
  RecurrenceOverride,
  TimedEvent
} from '#src/event'
import {
  add,
  addWallSpan,
  atWallTimeOf,
  compare,
  dayStart,
  daysBetween,
  duration,
  isDateOnly,
  plainDate,
  spanToIso,
  subtract,
  toCalendarDate,
  toIso,
  wallSpanBetween,
  zoned
} from '#src/time'
import type {
  CalendarDate,
  IsoDateTime,
  Moment,
  TimePoint,
  TimeSpan,
  TimeZoneId
} from '#src/time'

import {
  INSTANCE_SEPARATOR,
  WINDOW_BACKOFF_DAYS,
  unreadableDateReason
} from './constants'
import { InvalidRecurrenceError } from './errors'

export type RecurrenceWindow = {
  start: Moment
  end: Moment
}

const instanceId = (seriesId: EventId, recurrenceId: IsoDateTime): EventId =>
  `${seriesId}${INSTANCE_SEPARATOR}${recurrenceId}`

export const baseDateOf = <TData>(event: CalendarEvent<TData>): CalendarDate =>
  isAllDayEvent(event) ? event.start : toCalendarDate(event.start)

export const spanOf = <TData>(event: CalendarEvent<TData>): TimeSpan =>
  isAllDayEvent(event)
    ? duration({ days: daysBetween(event.start, event.end) })
    : wallSpanBetween(event.start, event.end)

export const seekDateOf = (
  window: RecurrenceWindow,
  span: TimeSpan
): CalendarDate =>
  subtract(toCalendarDate(window.start), {
    days: span.days + WINDOW_BACKOFF_DAYS
  })

export const startAt = <TData>(
  event: CalendarEvent<TData>,
  date: CalendarDate,
  context: NormalizeContext
): TimePoint =>
  isAllDayEvent(event)
    ? date
    : atWallTimeOf(date, event.start, context.timeZone, context.disambiguation)

export const startFromIso = <TData>(
  event: CalendarEvent<TData>,
  iso: IsoDateTime,
  context: NormalizeContext
): TimePoint => {
  try {
    if (!isAllDayEvent(event))
      return zoned(iso, context.timeZone, context.disambiguation)

    return isDateOnly(iso)
      ? plainDate(iso)
      : toCalendarDate(zoned(iso, context.timeZone))
  } catch (cause) {
    throw new InvalidRecurrenceError(event.id, unreadableDateReason(iso), cause)
  }
}

const allDayInstance = <TData>(
  event: AllDayEvent<TData>,
  start: CalendarDate,
  span: TimeSpan
): AllDayEvent<TData> => {
  const recurrenceId = toIso(start)

  return {
    ...event,
    id: instanceId(event.id, recurrenceId),
    seriesId: event.id,
    recurrenceId,
    recurrence: undefined,
    start,
    end: add(start, span)
  }
}

const timedInstance = <TData>(
  event: TimedEvent<TData>,
  start: Moment,
  span: TimeSpan,
  context: NormalizeContext
): TimedEvent<TData> => {
  const recurrenceId = toIso(start)

  return {
    ...event,
    id: instanceId(event.id, recurrenceId),
    seriesId: event.id,
    recurrenceId,
    recurrence: undefined,
    start,
    end: addWallSpan(start, span, context.timeZone, context.disambiguation)
  }
}

export const instanceAt = <TData>(
  event: CalendarEvent<TData>,
  start: TimePoint,
  span: TimeSpan,
  context: NormalizeContext
): CalendarEvent<TData> =>
  isAllDayEvent(event)
    ? allDayInstance(event, start as CalendarDate, span)
    : timedInstance(event, start as Moment, span, context)

export const keyOf = <TData>(
  event: CalendarEvent<TData>,
  iso: IsoDateTime,
  context: NormalizeContext
): IsoDateTime => toIso(startFromIso(event, iso, context))

export const boundsOf = <TData>(
  event: CalendarEvent<TData>,
  timeZone: TimeZoneId
): RecurrenceWindow =>
  isAllDayEvent(event)
    ? {
        start: dayStart(event.start, timeZone),
        end: dayStart(event.end, timeZone)
      }
    : { start: event.start, end: event.end }

export const overlaps = (
  bounds: RecurrenceWindow,
  window: RecurrenceWindow
): boolean =>
  compare(bounds.start, window.end) < 0 &&
  compare(bounds.end, window.start) >= 0

export const overrideInstance = <TData>(
  instance: CalendarEvent<TData>,
  override: RecurrenceOverride<TData>,
  span: TimeSpan,
  context: NormalizeContext
): CalendarEvent<TData> => {
  const kept =
    override.end === undefined && override.duration === undefined
      ? spanToIso(span)
      : override.duration

  return {
    ...normalizeEvent(
      {
        id: instance.id,
        start: override.start ?? toIso(instance.start),
        end: override.end,
        duration: kept,
        allDay: instance.allDay,
        timeZone: context.timeZone,
        data: override.data ?? instance.data
      },
      context
    ),
    seriesId: instance.seriesId,
    recurrenceId: instance.recurrenceId
  }
}
