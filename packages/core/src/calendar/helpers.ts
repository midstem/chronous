import { isAllDayEvent } from '#src/event'
import type { AllDayEvent, CalendarEvent, TimedEvent } from '#src/event'
import type { DayLayout, PlacedEvent } from '#src/layout'
import type { LaneRow, PlacedSpan } from '#src/lanes'
import type { DaySlot, RangeDay } from '#src/range'
import { toIso } from '#src/time'

import type {
  AllDayEntry,
  CalendarBar,
  CalendarBox,
  CalendarDay,
  CalendarEntry,
  CalendarRow,
  CalendarSlot,
  TimedEntry
} from './types'

const timedEntryOf = <TData>(event: TimedEvent<TData>): TimedEntry<TData> => ({
  id: event.id,
  allDay: false,
  start: toIso(event.start),
  end: toIso(event.end),
  seriesId: event.seriesId,
  recurrenceId: event.recurrenceId,
  data: event.data
})

const allDayEntryOf = <TData>(
  event: AllDayEvent<TData>
): AllDayEntry<TData> => ({
  id: event.id,
  allDay: true,
  start: toIso(event.start),
  end: toIso(event.end),
  seriesId: event.seriesId,
  recurrenceId: event.recurrenceId,
  data: event.data
})

const entryOf = <TData>(event: CalendarEvent<TData>): CalendarEntry<TData> =>
  isAllDayEvent(event) ? allDayEntryOf(event) : timedEntryOf(event)

const slotOf = (slot: DaySlot): CalendarSlot => ({
  ...slot,
  start: toIso(slot.start),
  end: toIso(slot.end)
})

const boxOf = <TData>(placed: PlacedEvent<TData>): CalendarBox<TData> => ({
  ...placed,
  event: timedEntryOf(placed.event),
  start: toIso(placed.start),
  end: toIso(placed.end)
})

const barOf = <TData>(placed: PlacedSpan<TData>): CalendarBar<TData> => ({
  ...placed,
  event: entryOf(placed.event),
  start: toIso(placed.start),
  end: toIso(placed.end)
})

export const rowOf = <TData>(row: LaneRow<TData>): CalendarRow<TData> => ({
  start: toIso(row.start),
  end: toIso(row.end),
  days: row.days,
  lanes: row.lanes,
  bars: row.spans.map((span) => barOf(span))
})

export const dayOf = <TData>(
  day: RangeDay,
  layout: DayLayout<TData>
): CalendarDay<TData> => ({
  ...day,
  date: toIso(day.date),
  start: toIso(day.start),
  end: toIso(day.end),
  slots: day.slots.map((slot) => slotOf(slot)),
  boxes: layout.events.map((placed) => boxOf(placed))
})
