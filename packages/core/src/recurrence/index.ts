import { isAllDayEvent } from '#src/event'
import type {
  CalendarEvent,
  NormalizeContext,
  RecurrenceInput
} from '#src/event'
import {
  compare,
  isDateOnly,
  plainDate,
  toCalendarDate,
  zoned
} from '#src/time'
import type { CalendarDate, IsoDateTime, Moment } from '#src/time'

import { malformedPartReason } from './constants'
import { InvalidRecurrenceError } from './errors'
import { ruleDates } from './expand'
import {
  baseDateOf,
  boundsOf,
  instanceAt,
  keyOf,
  overlaps,
  overrideInstance,
  spanOf,
  startAt,
  startFromIso
} from './helpers'
import type { RecurrenceWindow } from './helpers'
import { parseRule } from './parse'
import type { RecurrenceRule } from './types'

type UntilBound = {
  date: CalendarDate
  moment?: Moment
}

type Instances<TData> = Map<IsoDateTime, CalendarEvent<TData>>

const resolveUntil = <TData>(
  event: CalendarEvent<TData>,
  rule: RecurrenceRule,
  context: NormalizeContext
): UntilBound | undefined => {
  if (rule.until === undefined) return undefined

  try {
    if (isAllDayEvent(event) || isDateOnly(rule.until))
      return {
        date: isDateOnly(rule.until)
          ? plainDate(rule.until)
          : toCalendarDate(zoned(rule.until, context.timeZone))
      }

    const moment = zoned(rule.until, context.timeZone)

    return { date: toCalendarDate(moment), moment }
  } catch (cause) {
    throw new InvalidRecurrenceError(
      event.id,
      malformedPartReason('UNTIL', rule.until),
      cause
    )
  }
}

const collectRule = <TData>(
  event: CalendarEvent<TData>,
  rule: RecurrenceRule,
  window: RecurrenceWindow,
  context: NormalizeContext,
  instances: Instances<TData>
): void => {
  const span = spanOf(event)
  const until = resolveUntil(event, rule, context)

  for (const date of ruleDates(rule, baseDateOf(event), until?.date)) {
    const instance = instanceAt(
      event,
      startAt(event, date, context),
      span,
      context
    )
    const bounds = boundsOf(instance, context.timeZone)

    if (until?.moment && compare(bounds.start, until.moment) > 0) return

    if (compare(bounds.start, window.end) >= 0) return

    if (overlaps(bounds, window))
      instances.set(instance.recurrenceId as IsoDateTime, instance)
  }
}

const collectDates = <TData>(
  event: CalendarEvent<TData>,
  dates: readonly IsoDateTime[],
  window: RecurrenceWindow,
  context: NormalizeContext,
  instances: Instances<TData>
): void => {
  const span = spanOf(event)

  for (const iso of dates) {
    const instance = instanceAt(
      event,
      startFromIso(event, iso, context),
      span,
      context
    )

    if (overlaps(boundsOf(instance, context.timeZone), window))
      instances.set(instance.recurrenceId as IsoDateTime, instance)
  }
}

const applyOverrides = <TData>(
  event: CalendarEvent<TData>,
  recurrence: RecurrenceInput<TData>,
  window: RecurrenceWindow,
  context: NormalizeContext,
  instances: Instances<TData>
): void => {
  const span = spanOf(event)

  for (const override of recurrence.overrides ?? []) {
    const key = keyOf(event, override.recurrenceId, context)

    instances.delete(key)

    if (override.cancelled) continue

    const base = instanceAt(
      event,
      startFromIso(event, override.recurrenceId, context),
      span,
      context
    )
    const overridden = overrideInstance(base, override, span, context)

    if (overlaps(boundsOf(overridden, context.timeZone), window))
      instances.set(key, overridden)
  }
}

export const expandEvent = <TData>(
  event: CalendarEvent<TData>,
  recurrence: RecurrenceInput<TData>,
  window: RecurrenceWindow,
  context: NormalizeContext
): CalendarEvent<TData>[] => {
  const instances: Instances<TData> = new Map()

  if (recurrence.rule !== undefined)
    collectRule(
      event,
      parseRule(event.id, recurrence.rule),
      window,
      context,
      instances
    )

  collectDates(event, recurrence.dates ?? [], window, context, instances)

  for (const iso of recurrence.exceptions ?? [])
    instances.delete(keyOf(event, iso, context))

  applyOverrides(event, recurrence, window, context, instances)

  return [...instances.values()].sort((a, b) =>
    compare(
      boundsOf(a, context.timeZone).start,
      boundsOf(b, context.timeZone).start
    )
  )
}

export const expandEvents = <TData>(
  events: readonly CalendarEvent<TData>[],
  window: RecurrenceWindow,
  context: NormalizeContext
): CalendarEvent<TData>[] =>
  events.flatMap((event) =>
    event.recurrence
      ? expandEvent(event, event.recurrence, window, context)
      : [event]
  )

export { InvalidRecurrenceError } from './errors'

export { parseRule } from './parse'

export type { RecurrenceWindow } from './helpers'

export type * from './types'
