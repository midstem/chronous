import { isAllDayEvent } from '#src/event'
import type { CalendarEvent, TimedEvent } from '#src/event'
import type { RangeDay } from '#src/range'
import {
  MINUTES_IN_DAY,
  add,
  compare,
  dayStart,
  daysBetween,
  minuteOfDay,
  toCalendarDate
} from '#src/time'
import type { TimeZoneId } from '#src/time'

import { MIN_LANE_MINUTES, NOT_FOUND } from './constants'
import type { EventBounds, LaneSpan, LaneStack } from './types'

const last = <TItem>(items: readonly TItem[]): TItem => items[items.length - 1]

const wallMinutes = <TData>(event: TimedEvent<TData>): number =>
  daysBetween(toCalendarDate(event.start), toCalendarDate(event.end)) *
    MINUTES_IN_DAY +
  minuteOfDay(event.end) -
  minuteOfDay(event.start)

export const isLaneEvent = <TData>(event: CalendarEvent<TData>): boolean =>
  isAllDayEvent(event) || wallMinutes(event) >= MIN_LANE_MINUTES

export const boundsOf = <TData>(
  event: CalendarEvent<TData>,
  timeZone: TimeZoneId
): EventBounds<TData> =>
  isAllDayEvent(event)
    ? {
        event,
        start: dayStart(event.start, timeZone),
        end: dayStart(event.end, timeZone)
      }
    : { event, start: event.start, end: event.end }

const coversDay = <TData>(bounds: EventBounds<TData>, day: RangeDay): boolean =>
  compare(bounds.start, day.end) < 0 && compare(bounds.end, day.start) > 0

export const span = <TData>(
  bounds: EventBounds<TData>,
  days: readonly RangeDay[]
): LaneSpan<TData> | undefined => {
  const startDay = days.findIndex((day) => coversDay(bounds, day))

  if (startDay === NOT_FOUND) return undefined

  const covered = days
    .slice(startDay)
    .filter((day) => coversDay(bounds, day)).length

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
