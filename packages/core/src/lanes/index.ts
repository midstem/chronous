import type { CalendarEvent } from '#src/event'
import type { DateRange, RangeDay } from '#src/range'
import { add, timeZoneOf } from '#src/time'

import { WEEK_ROW_DAYS, WEEK_ROW_VIEWS } from './constants'
import { boundsOf, dayStarts, isLaneEvent, order, span, stack } from './helpers'
import type { EventBounds, LaneRow, LaneStack } from './types'

const chunk = (days: readonly RangeDay[], size: number): RangeDay[][] =>
  Array.from({ length: Math.ceil(days.length / size) }, (_, index) =>
    days.slice(index * size, index * size + size)
  )

const rowsOf = (range: DateRange): RangeDay[][] =>
  WEEK_ROW_VIEWS.includes(range.view)
    ? chunk(range.days, WEEK_ROW_DAYS)
    : [range.days]

const stackOf = <TData>(
  bounds: readonly EventBounds<TData>[],
  days: readonly RangeDay[]
): LaneStack<TData> =>
  stack(
    order(
      bounds.flatMap((item) => {
        const placed = span(item, days)

        return placed ? [placed] : []
      })
    )
  )

const buildRow = <TData>(
  bounds: readonly EventBounds<TData>[],
  days: readonly RangeDay[]
): LaneRow<TData> => {
  const { lanes, spans } = stackOf(bounds, days)

  return {
    start: days[0].date,
    end: add(days[0].date, { days: days.length }),
    dayCount: days.length,
    lanes,
    spans
  }
}

export const buildLanes = <TData>(
  range: DateRange,
  events: readonly CalendarEvent<TData>[]
): LaneRow<TData>[] => {
  const startOf = dayStarts(timeZoneOf(range.start))
  const bounds = events
    .filter(isLaneEvent)
    .map((event) => boundsOf(event, startOf))

  return rowsOf(range).map((days) => buildRow(bounds, days))
}

export { isLaneEvent } from './helpers'

export type * from './types'
