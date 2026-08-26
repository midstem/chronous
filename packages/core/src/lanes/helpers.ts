import { isAllDayEvent } from '#src/event'
import type { CalendarEvent, TimedEvent } from '#src/event'
import type { RangeDay } from '#src/range'
import {
  MINUTES_IN_DAY,
  add,
  compare,
  dayStart,
  minuteOfDay,
  wallDay
} from '#src/time'
import type { CalendarDate, Moment, TimeZoneId } from '#src/time'

import { MIN_LANE_MINUTES, NOT_FOUND } from './constants'
import type { DayStarts, EventBounds, LaneSpan, LaneStack } from './types'

const last = <TItem>(items: readonly TItem[]): TItem => items[items.length - 1]

const wallMinutes = <TData>(event: TimedEvent<TData>): number =>
  (wallDay(event.end) - wallDay(event.start)) * MINUTES_IN_DAY +
  minuteOfDay(event.end) -
  minuteOfDay(event.start)

export const isLaneEvent = <TData>(event: CalendarEvent<TData>): boolean =>
  isAllDayEvent(event) || wallMinutes(event) >= MIN_LANE_MINUTES

export const dayStarts = (timeZone: TimeZoneId): DayStarts => {
  const cache = new Map<number, Moment>()

  return (date: CalendarDate): Moment => {
    const key = wallDay(date)
    const cached = cache.get(key)

    if (cached) return cached

    const start = dayStart(date, timeZone)

    cache.set(key, start)

    return start
  }
}

export const boundsOf = <TData>(
  event: CalendarEvent<TData>,
  startOf: DayStarts
): EventBounds<TData> =>
  isAllDayEvent(event)
    ? { event, start: startOf(event.start), end: startOf(event.end) }
    : { event, start: event.start, end: event.end }

const coversDay = <TData>(bounds: EventBounds<TData>, day: RangeDay): boolean =>
  compare(bounds.start, day.end) < 0 && compare(bounds.end, day.start) > 0

export const span = <TData>(
  bounds: EventBounds<TData>,
  days: readonly RangeDay[]
): LaneSpan<TData> | undefined => {
  const startDay = days.findIndex((day) => coversDay(bounds, day))

  if (startDay === NOT_FOUND) return undefined

  let covered = 0

  for (
    let index = startDay;
    index < days.length && coversDay(bounds, days[index]);
    index += 1
  )
    covered += 1

  return {
    event: bounds.event,
    start: days[startDay].date,
    end: add(days[startDay].date, { days: covered }),
    startDay,
    endDay: startDay + covered,
    days: covered,
    left: startDay / days.length,
    width: covered / days.length,
    continuesBefore: compare(bounds.start, days[0].start) < 0,
    continuesAfter: compare(bounds.end, last(days).end) > 0
  }
}

const byId = <TData>(a: LaneSpan<TData>, b: LaneSpan<TData>): number => {
  if (a.event.id === b.event.id) return 0

  return a.event.id < b.event.id ? -1 : 1
}

export const order = <TData>(
  spans: readonly LaneSpan<TData>[]
): LaneSpan<TData>[] =>
  [...spans].sort(
    (a, b) => a.startDay - b.startDay || b.endDay - a.endDay || byId(a, b)
  )

const overlaps = <TData>(a: LaneSpan<TData>, b: LaneSpan<TData>): boolean =>
  a.startDay < b.endDay && b.startDay < a.endDay

export const stack = <TData>(
  spans: readonly LaneSpan<TData>[]
): LaneStack<TData> => {
  const lanes: LaneSpan<TData>[][] = []
  const placed = spans.map((span) => {
    const free = lanes.findIndex((items) => !overlaps(last(items), span))

    if (free === NOT_FOUND) {
      const lane = lanes.length

      lanes.push([span])

      return { span, lane }
    }

    lanes[free].push(span)

    return { span, lane: free }
  })

  return {
    lanes: lanes.length,
    spans: placed.map(({ span, lane }) => ({
      ...span,
      lane,
      lanes: lanes.length
    }))
  }
}
