import type { CalendarEvent, TimedEvent } from '#src/event'
import { buildLanes } from '#src/lanes'
import type { DateRange, RangeDay } from '#src/range'
import { compare } from '#src/time'

import { clip, cluster, firstDay, isGridEvent, order, place } from './helpers'
import type { DayLayout, Partition, RangeLayout, Segment } from './types'

const partition = <TData>(
  events: readonly CalendarEvent<TData>[]
): Partition<TData> => {
  const grid: TimedEvent<TData>[] = []
  const lane: CalendarEvent<TData>[] = []

  for (const event of events) {
    if (isGridEvent(event)) grid.push(event)
    else lane.push(event)
  }

  return { grid, lane }
}

const segmentsByDay = <TData>(
  events: readonly TimedEvent<TData>[],
  days: readonly RangeDay[]
): Segment<TData>[][] => {
  const buckets: Segment<TData>[][] = days.map(() => [])

  for (const event of events) {
    const from = firstDay(days, event.start)

    for (let index = from; index < days.length; index += 1) {
      if (index > from && compare(days[index].start, event.end) >= 0) break

      const segment = clip(event, days[index])

      if (segment) buckets[index].push(segment)
    }
  }

  return buckets
}

const layoutDay = <TData>(
  day: RangeDay,
  segments: readonly Segment<TData>[]
): DayLayout<TData> => ({
  date: day.date,
  events: cluster(order(segments)).flatMap(place)
})

export const buildLayout = <TData>(
  range: DateRange,
  events: readonly CalendarEvent<TData>[]
): RangeLayout<TData> => {
  const { grid, lane } = partition(events)
  const buckets = segmentsByDay(grid, range.days)

  return {
    days: range.days.map((day, index) => layoutDay(day, buckets[index])),
    rows: buildLanes(range, lane)
  }
}

export type * from './types'
