import type { EventInput } from '#src/event'
import type { CalendarRange } from '#src/range'

import type { CalendarLayout } from '../types'
import { normalizeFallbackEvent } from './event'
import { buildFallbackLayout } from './layout'
import { buildFallbackRange } from './range'
import { expandFallbackRecurrence } from './recurrence'
import { warnApproximation, warnFallbackOnce } from './warn'
import type { FallbackEvent } from './types'

export const buildCalendarDateFallback = <TData>(
  range: CalendarRange,
  events: readonly EventInput<TData>[]
): CalendarLayout<TData> => {
  warnFallbackOnce()

  const builtRange = buildFallbackRange(range)
  const normalizedEvents: FallbackEvent<TData>[] = []
  for (const event of events) {
    try {
      const base = normalizeFallbackEvent(event, range.timeZone)
      normalizedEvents.push(
        ...expandFallbackRecurrence(
          event,
          base,
          builtRange.days,
          range.timeZone
        )
      )
    } catch (cause) {
      const reason = cause instanceof Error ? cause.message : String(cause)
      warnApproximation(
        `event:${event.id}:${reason}`,
        `Event "${event.id}" was omitted from the Date fallback: ${reason}`
      )
    }
  }

  const layout = buildFallbackLayout(
    builtRange.view,
    builtRange.days,
    normalizedEvents,
    range.timeZone
  )

  return {
    view: builtRange.view,
    start: builtRange.startIso,
    end: builtRange.endIso,
    days: layout.days,
    rows: layout.rows
  }
}

export { resetFallbackWarning, warnFallbackOnce } from './warn'
