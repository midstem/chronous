import type { EventInput } from '#src/event'
import { INSTANCE_SEPARATOR } from '../../recurrence/constants'
import { parseRule } from '../../recurrence/parse'

import { matchesFallbackRule } from './candidates'
import { normalizeFallbackEvent } from './event'
import {
  addDaysToDate,
  daysDifference,
  getZonedParts,
  isDateOnlyString,
  parseDateOnly,
  parseTimedIso
} from './time'
import type { FallbackDay, FallbackEvent } from './types'
import { warnApproximation } from './warn'

const MS_PER_DAY = 86_400_000

const overlaps = <TData>(
  event: FallbackEvent<TData>,
  days: FallbackDay[]
): boolean => {
  const first = days[0]
  const last = days[days.length - 1]
  return event.allDay
    ? event.start < addDaysToDate(last.date, 1) && event.end > first.date
    : event.startEpoch < last.endEpoch && event.endEpoch >= first.startEpoch
}

export const expandFallbackRecurrence = <TData>(
  input: EventInput<TData>,
  base: FallbackEvent<TData>,
  days: FallbackDay[],
  timeZone: string
): FallbackEvent<TData>[] => {
  const recurrence = input.recurrence
  if (!recurrence) return [base]

  warnApproximation(
    `recurrence:${input.id}`,
    `Recurring event "${input.id}" uses approximate Date fallback expansion. Install the Temporal polyfill for exact recurrence and time-zone behavior.`
  )

  const sourceZone = input.timeZone ?? timeZone
  const anchor = base.allDay
    ? base.start
    : getZonedParts(base.startEpoch, sourceZone).dateString
  const wallTime = base.allDay
    ? ''
    : getZonedParts(base.startEpoch, sourceZone).isoString.slice(10, 19)
  const lengthDays = base.allDay ? daysDifference(base.start, base.end) : 0
  const lengthMs = base.allDay ? 0 : base.endEpoch - base.startEpoch
  const instances = new Map<string, FallbackEvent<TData>>()

  const keyOf = (value: string): string =>
    base.allDay
      ? isDateOnlyString(value)
        ? value
        : getZonedParts(
            parseTimedIso(
              input.id,
              value,
              sourceZone,
              'has an unreadable recurrence date'
            ),
            sourceZone
          ).dateString
      : getZonedParts(
          parseTimedIso(
            input.id,
            value,
            sourceZone,
            'has an unreadable recurrence date'
          ),
          sourceZone
        ).isoString

  const make = (
    startValue: string,
    recurrenceId?: string,
    data = input.data
  ): FallbackEvent<TData> => {
    if (base.allDay) {
      const start = keyOf(startValue)
      const key = recurrenceId ?? start
      return {
        id: `${input.id}${INSTANCE_SEPARATOR}${key}`,
        seriesId: input.id,
        recurrenceId: key,
        allDay: true,
        start,
        end: addDaysToDate(start, lengthDays),
        data
      }
    }
    const startEpoch = parseTimedIso(
      input.id,
      startValue,
      sourceZone,
      'has an unreadable recurrence date'
    )
    const endEpoch = startEpoch + lengthMs
    const startIso = getZonedParts(startEpoch, timeZone).isoString
    const key = recurrenceId ?? getZonedParts(startEpoch, sourceZone).isoString
    return {
      id: `${input.id}${INSTANCE_SEPARATOR}${key}`,
      seriesId: input.id,
      recurrenceId: key,
      allDay: false,
      startEpoch,
      endEpoch,
      startIso,
      endIso: getZonedParts(endEpoch, timeZone).isoString,
      data
    }
  }

  let rule: ReturnType<typeof parseRule> | undefined
  if (recurrence.rule) {
    try {
      rule = parseRule(input.id, recurrence.rule)
    } catch (cause) {
      warnApproximation(
        `recurrence-rule:${input.id}`,
        `The recurrence rule for "${input.id}" could not be read; only its original and explicit dates are shown: ${String(cause)}`
      )
      const original = make(input.start)
      instances.set(original.recurrenceId as string, original)
    }
  }

  if (rule) {
    if (
      rule.bySetPos.length > 0 ||
      (rule.byDay.length > 0 && rule.frequency !== 'WEEKLY')
    ) {
      warnApproximation(
        `recurrence-filters:${input.id}`,
        `Some recurrence filters for "${input.id}" may differ in Date fallback.`
      )
    }
    const first = base.allDay
      ? days[0].date
      : getZonedParts(days[0].startEpoch, sourceZone).dateString
    const last = base.allDay
      ? days[days.length - 1].date
      : getZonedParts(days[days.length - 1].endEpoch - 1, sourceZone).dateString
    const backoff = Math.min(
      366,
      base.allDay
        ? Math.max(1, lengthDays)
        : Math.max(1, Math.ceil(lengthMs / MS_PER_DAY))
    )
    const from =
      anchor > addDaysToDate(first, -backoff)
        ? anchor
        : addDaysToDate(first, -backoff)
    let until = rule.until
    let untilEpoch: number | undefined
    if (until && isDateOnlyString(until)) {
      try {
        parseDateOnly(until)
      } catch (cause) {
        warnApproximation(
          `recurrence-until:${input.id}`,
          `UNTIL for "${input.id}" could not be read and was ignored in Date fallback: ${String(cause)}`
        )
        until = undefined
      }
    }
    if (until && !isDateOnlyString(until)) {
      try {
        untilEpoch = parseTimedIso(
          input.id,
          until,
          sourceZone,
          'has an unreadable UNTIL'
        )
      } catch (cause) {
        warnApproximation(
          `recurrence-until:${input.id}`,
          `UNTIL for "${input.id}" could not be read and was ignored in Date fallback: ${String(cause)}`
        )
        until = undefined
      }
    }

    const candidateCache = new Map<string, string[]>()
    let generated = 0
    const scanFrom = rule.count === undefined ? from : anchor
    for (let date = scanFrom; date <= last; date = addDaysToDate(date, 1)) {
      if (!matchesFallbackRule(rule, anchor, date, candidateCache)) continue
      generated += 1
      if (rule.count !== undefined && generated > rule.count) break
      if (date < from) continue
      if (until && isDateOnlyString(until) && date > until) continue
      const occurrence = make(base.allDay ? date : `${date}${wallTime}`)
      if (
        untilEpoch !== undefined &&
        !occurrence.allDay &&
        occurrence.startEpoch > untilEpoch
      )
        continue
      instances.set(occurrence.recurrenceId as string, occurrence)
    }
  }

  for (const value of recurrence.dates ?? []) {
    try {
      const instance = make(value)
      instances.set(instance.recurrenceId as string, instance)
    } catch (cause) {
      warnApproximation(
        `recurrence-date:${input.id}:${value}`,
        `Recurrence date "${value}" for "${input.id}" was skipped: ${String(cause)}`
      )
    }
  }

  for (const value of recurrence.exceptions ?? []) {
    try {
      instances.delete(keyOf(value))
    } catch (cause) {
      warnApproximation(
        `recurrence-exception:${input.id}:${value}`,
        `Exception "${value}" for "${input.id}" could not be read: ${String(cause)}`
      )
    }
  }

  for (const override of recurrence.overrides ?? []) {
    try {
      const key = keyOf(override.recurrenceId)
      instances.delete(key)
      if (override.cancelled) continue
      const instance = make(
        override.start ?? override.recurrenceId,
        key,
        override.data ?? input.data
      )
      const changed =
        override.end !== undefined || override.duration !== undefined
      if (changed) {
        const normalized = normalizeFallbackEvent(
          {
            ...input,
            recurrence: undefined,
            start: override.start ?? override.recurrenceId,
            end: override.end,
            duration: override.duration,
            data: override.data ?? input.data
          },
          timeZone
        )
        instances.set(key, {
          ...normalized,
          id: instance.id,
          seriesId: input.id,
          recurrenceId: key
        })
      } else {
        instances.set(key, instance)
      }
    } catch (cause) {
      warnApproximation(
        `recurrence-override:${input.id}:${override.recurrenceId}`,
        `Override for "${input.id}" could not be read: ${String(cause)}`
      )
    }
  }

  if (
    !recurrence.rule &&
    (recurrence.dates?.length ?? 0) === 0 &&
    (recurrence.overrides?.length ?? 0) === 0
  ) {
    const instance = make(input.start)
    instances.set(instance.recurrenceId as string, instance)
  }

  return [...instances.values()].filter((instance) => overlaps(instance, days))
}
