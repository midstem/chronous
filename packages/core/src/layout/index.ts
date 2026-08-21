import { isTimedEvent } from '#src/event'
import type { CalendarEvent, TimedEvent } from '#src/event'
import type { DateRange, RangeDay } from '#src/range'

import { clip, cluster, order, place } from './helpers'
import type { DayLayout, RangeLayout, Segment } from './types'

const segmentsOf = <TData>(
  events: readonly TimedEvent<TData>[],
  day: RangeDay
): Segment<TData>[] =>
  events.flatMap((event) => {
    const segment = clip(event, day)

    return segment ? [segment] : []
  })

const layoutDay = <TData>(
  events: readonly TimedEvent<TData>[],
  day: RangeDay
): DayLayout<TData> => ({
  date: day.date,
  events: cluster(order(segmentsOf(events, day))).flatMap(place)
})

export const buildLayout = <TData>(
  range: DateRange,
  events: readonly CalendarEvent<TData>[]
): RangeLayout<TData> => {
  const timed = events.filter(isTimedEvent)

  return { days: range.days.map((day) => layoutDay(timed, day)) }
}

export type * from './types'
