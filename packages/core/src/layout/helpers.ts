import { isTimedEvent } from '#src/event'
import type { CalendarEvent, TimedEvent } from '#src/event'
import { isLaneEvent } from '#src/lanes'
import {
  MINUTES_IN_DAY,
  compare,
  minuteOfDay,
  minutesBetween,
  wallDay
} from '#src/time'
import type { Moment } from '#src/time'
import type { RangeDay } from '#src/range'

import {
  HALF,
  NO_COLUMN,
  NO_REACH,
  SINGLE_COLUMN,
  SINGLE_DAY
} from './constants'
import type { Packing, PlacedEvent, Segment } from './types'

export const isGridEvent = <TData>(
  event: CalendarEvent<TData>
): event is TimedEvent<TData> => isTimedEvent(event) && !isLaneEvent(event)

const later = (a: Moment, b: Moment): Moment => (compare(a, b) > 0 ? a : b)

const earlier = (a: Moment, b: Moment): Moment => (compare(a, b) < 0 ? a : b)

const touchesDay = <TData>(event: TimedEvent<TData>, day: RangeDay): boolean =>
  compare(event.start, day.end) < 0 &&
  (compare(event.start, day.start) >= 0 || compare(event.end, day.start) > 0)

const gridMinute = (moment: Moment, day: RangeDay): number =>
  wallDay(moment) > wallDay(day.date) ? MINUTES_IN_DAY : minuteOfDay(moment)

export const firstDay = (days: readonly RangeDay[], start: Moment): number => {
  let low = 0
  let high = days.length - SINGLE_DAY

  while (low < high) {
    const middle = Math.ceil((low + high) / HALF)

    if (compare(days[middle].start, start) > 0) high = middle - SINGLE_DAY
    else low = middle
  }

  return low
}

export const clip = <TData>(
  event: TimedEvent<TData>,
  day: RangeDay
): Segment<TData> | undefined => {
  if (!touchesDay(event, day)) return undefined

  const start = later(event.start, day.start)
  const end = earlier(event.end, day.end)
  const startMinute = minuteOfDay(start)
  const endMinute = Math.max(startMinute, gridMinute(end, day))

  return {
    event,
    start,
    end,
    startMinute,
    endMinute,
    minutes: minutesBetween(start, end),
    top: startMinute / MINUTES_IN_DAY,
    height: (endMinute - startMinute) / MINUTES_IN_DAY,
    continuesBefore: compare(event.start, day.start) < 0,
    continuesAfter: compare(event.end, day.end) > 0
  }
}

const byId = <TData>(a: Segment<TData>, b: Segment<TData>): number => {
  if (a.event.id === b.event.id) return 0

  return a.event.id < b.event.id ? -1 : 1
}

export const order = <TData>(
  segments: readonly Segment<TData>[]
): Segment<TData>[] =>
  [...segments].sort(
    (a, b) =>
      a.startMinute - b.startMinute || b.endMinute - a.endMinute || byId(a, b)
  )

const overlaps = <TData>(a: Segment<TData>, b: Segment<TData>): boolean =>
  a.startMinute === b.startMinute ||
  (a.startMinute < b.endMinute && b.startMinute < a.endMinute)

const last = <TData>(segments: readonly Segment<TData>[]): Segment<TData> =>
  segments[segments.length - 1]

export const cluster = <TData>(
  segments: readonly Segment<TData>[]
): Segment<TData>[][] => {
  const clusters: Segment<TData>[][] = []
  let reach = NO_REACH

  for (const segment of segments) {
    const current = clusters[clusters.length - 1]
    const joins =
      current !== undefined &&
      (segment.startMinute < reach ||
        segment.startMinute === last(current).startMinute)

    if (joins) {
      current.push(segment)
      reach = Math.max(reach, segment.endMinute)
    } else {
      clusters.push([segment])
      reach = segment.endMinute
    }
  }

  return clusters
}

const columnsOf = <TData>(
  segments: readonly Segment<TData>[]
): Packing<TData> => {
  const columns: Segment<TData>[][] = []
  const indexes: number[] = []

  for (const segment of segments) {
    const free = columns.findIndex((items) => !overlaps(last(items), segment))

    if (free === NO_COLUMN) {
      indexes.push(columns.length)
      columns.push([segment])
    } else {
      indexes.push(free)
      columns[free].push(segment)
    }
  }

  return { columns, indexes }
}

const spanOf = <TData>(
  columns: readonly Segment<TData>[][],
  from: number,
  segment: Segment<TData>
): number => {
  let span = SINGLE_COLUMN

  for (let next = from + SINGLE_COLUMN; next < columns.length; next += 1) {
    if (columns[next].some((other) => overlaps(other, segment))) break

    span += SINGLE_COLUMN
  }

  return span
}

export const place = <TData>(
  segments: readonly Segment<TData>[]
): PlacedEvent<TData>[] => {
  const { columns, indexes } = columnsOf(segments)
  const total = columns.length

  return segments.map((segment, index) => {
    const column = indexes[index]
    const span = spanOf(columns, column, segment)

    return {
      ...segment,
      column,
      columns: total,
      span,
      left: column / total,
      width: span / total
    }
  })
}
