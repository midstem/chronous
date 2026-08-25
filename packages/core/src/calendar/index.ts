import { normalizeEvents } from '#src/event'
import type { EventInput, NormalizeContext } from '#src/event'
import { buildLayout } from '#src/layout'
import { buildRange } from '#src/range'
import type { RangeSpec } from '#src/range'
import { expandEvents } from '#src/recurrence'
import { toIso } from '#src/time'

import { dayOf, rowOf } from './helpers'
import type { Calendar } from './types'

const contextOf = (spec: RangeSpec): NormalizeContext => ({
  timeZone: spec.timeZone,
  disambiguation: spec.disambiguation
})

export const buildCalendar = <TData>(
  spec: RangeSpec,
  events: readonly EventInput<TData>[]
): Calendar<TData> => {
  const range = buildRange(spec)
  const context = contextOf(spec)
  const layout = buildLayout(
    range,
    expandEvents(normalizeEvents(events, context), range, context)
  )

  return {
    view: range.view,
    start: toIso(range.start),
    end: toIso(range.end),
    days: range.days.map((day, index) => dayOf(day, layout.days[index])),
    rows: layout.rows.map((row) => rowOf(row))
  }
}

export type * from './types'
