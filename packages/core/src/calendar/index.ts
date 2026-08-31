import { normalizeEvents } from '#src/event'
import type { EventInput, NormalizeContext } from '#src/event'
import { buildLayout } from '#src/layout'
import { buildRange } from '#src/range'
import type { CalendarRange } from '#src/range'
import { expandEvents } from '#src/recurrence'
import { toIso } from '#src/time'

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
  const built = buildRange(range)
  const context = contextOf(range)
  const layout = buildLayout(
    built,
    expandEvents(normalizeEvents(events, context), built, context)
  )

  return {
    view: built.view,
    start: toIso(built.start),
    end: toIso(built.end),
    days: built.days.map((day, index) => dayOf(day, layout.days[index])),
    rows: layout.rows.map((row) => rowOf(row))
  }
}

export type * from './types'
