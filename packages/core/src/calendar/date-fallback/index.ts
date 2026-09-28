import type { EventInput } from '#src/event'
import type { CalendarRange } from '#src/range'

import type { CalendarLayout } from '../types'
import { normalizeFallbackEvent } from './event'
import { buildFallbackLayout } from './layout'
import { buildFallbackRange } from './range'
import { warnFallbackOnce } from './warn'

export const buildCalendarDateFallback = <TData>(
  range: CalendarRange,
  events: readonly EventInput<TData>[]
): CalendarLayout<TData> => {
  warnFallbackOnce()

  const builtRange = buildFallbackRange(range)
  const normalizedEvents = events.map((event) =>
    normalizeFallbackEvent(event, range.timeZone)
  )

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
