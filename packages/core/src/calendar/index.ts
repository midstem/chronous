import { normalizeEvent } from '#src/event'
import type { CalendarEvent, EventInput, NormalizeContext } from '#src/event'
import { buildLayout } from '#src/layout'
import { buildRange } from '#src/range'
import type { CalendarRange } from '#src/range'
import { expandEvent } from '#src/recurrence'
import { isTemporalAvailable } from '#src/runtime'
import { requireTemporal, toIso, withTimeZone } from '#src/time'

import { buildCalendarDateFallback } from './date-fallback'
import { dayOf, rowOf } from './helpers'
import type { CalendarLayout } from './types'

const contextOf = (range: CalendarRange): NormalizeContext => ({
  timeZone: range.timeZone,
  disambiguation: range.disambiguation
})

export const buildCalendar = <TData>(
  range: CalendarRange,
  events: readonly EventInput<TData>[]
): CalendarLayout<TData> => {
  if (!isTemporalAvailable()) {
    return buildCalendarDateFallback(range, events)
  }

  requireTemporal()

  const built = buildRange(range)
  const context = contextOf(range)
  const expanded = events.flatMap((input): CalendarEvent<TData>[] => {
    const sourceZone = input.timeZone ?? range.timeZone
    const sourceContext = { ...context, timeZone: sourceZone }
    const event = normalizeEvent(input, sourceContext)
    const instances = input.recurrence
      ? expandEvent(
          event,
          input.recurrence,
          {
            start: withTimeZone(built.start, sourceZone),
            end: withTimeZone(built.end, sourceZone)
          },
          sourceContext
        )
      : [event]

    return instances.map((instance) =>
      instance.allDay
        ? instance
        : {
            ...instance,
            start: withTimeZone(instance.start, range.timeZone),
            end: withTimeZone(instance.end, range.timeZone)
          }
    )
  })
  const layout = buildLayout(built, expanded)

  return {
    view: built.view,
    start: toIso(built.start),
    end: toIso(built.end),
    days: built.days.map((day, index) => dayOf(day, layout.days[index])),
    rows: layout.rows.map((row) => rowOf(row))
  }
}

export type * from './types'
