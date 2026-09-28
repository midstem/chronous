import type { ViewKind } from '#src/range'

import type {
  CalendarBar,
  CalendarBox,
  CalendarDay,
  CalendarEntry,
  CalendarRow,
  TimedEntry
} from '../types'
import { addDaysToDate, daysDifference, getZonedParts } from './time'
import type {
  FallbackAllDayEvent,
  FallbackDay,
  FallbackEvent,
  FallbackTimedEvent
} from './types'

type Segment<TData> = {
  event: TimedEntry<TData>
  start: string
  end: string
  startMinute: number
  endMinute: number
  minutes: number
  top: number
  height: number
  continuesBefore: boolean
  continuesAfter: boolean
}

type LaneSpan<TData> = {
  event: CalendarEntry<TData>
  start: string
  end: string
  startDay: number
  endDay: number
  dayCount: number
  left: number
  width: number
  continuesBefore: boolean
  continuesAfter: boolean
}

const isAllDay = <TData>(
  event: FallbackEvent<TData>
): event is FallbackAllDayEvent<TData> => event.allDay

const isTimed = <TData>(
  event: FallbackEvent<TData>
): event is FallbackTimedEvent<TData> => !event.allDay

const wallMinutesOf = <TData>(
  event: FallbackTimedEvent<TData>,
  timeZone: string
): number => {
  const startZoned = getZonedParts(event.startEpoch, timeZone)
  const endZoned = getZonedParts(event.endEpoch, timeZone)
  const daysDiff = daysDifference(startZoned.dateString, endZoned.dateString)
  const startMinute =
    startZoned.hour * 60 + startZoned.minute + startZoned.second / 60
  const endMinute = endZoned.hour * 60 + endZoned.minute + endZoned.second / 60
  return daysDiff * 1440 + endMinute - startMinute
}

const isLaneEvent = <TData>(
  event: FallbackEvent<TData>,
  timeZone: string
): boolean => isAllDay(event) || wallMinutesOf(event, timeZone) >= 1440

const last = <T>(items: readonly T[]): T => items[items.length - 1]

const byId = <TData>(a: Segment<TData>, b: Segment<TData>): number => {
  if (a.event.id === b.event.id) return 0
  return a.event.id < b.event.id ? -1 : 1
}

const orderSegments = <TData>(
  segments: readonly Segment<TData>[]
): Segment<TData>[] =>
  [...segments].sort(
    (a, b) =>
      a.startMinute - b.startMinute || b.endMinute - a.endMinute || byId(a, b)
  )

const overlapsSegment = <TData>(
  a: Segment<TData>,
  b: Segment<TData>
): boolean =>
  a.startMinute === b.startMinute ||
  (a.startMinute < b.endMinute && b.startMinute < a.endMinute)

const clusterSegments = <TData>(
  segments: readonly Segment<TData>[]
): Segment<TData>[][] => {
  const clusters: Segment<TData>[][] = []
  let reach = -1

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
): { columns: Segment<TData>[][]; indexes: number[] } => {
  const columns: Segment<TData>[][] = []
  const indexes: number[] = []

  for (const segment of segments) {
    const free = columns.findIndex(
      (items) => !overlapsSegment(last(items), segment)
    )

    if (free === -1) {
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
  let span = 1

  for (let next = from + 1; next < columns.length; next += 1) {
    if (columns[next].some((other) => overlapsSegment(other, segment))) break
    span += 1
  }

  return span
}

const placeSegments = <TData>(
  segments: readonly Segment<TData>[]
): CalendarBox<TData>[] => {
  const { columns, indexes } = columnsOf(segments)
  const total = columns.length

  return segments.map((segment, index) => {
    const column = indexes[index]
    const span = spanOf(columns, column, segment)

    return {
      event: segment.event,
      start: segment.start,
      end: segment.end,
      startMinute: segment.startMinute,
      endMinute: segment.endMinute,
      minutes: segment.minutes,
      top: segment.top,
      height: segment.height,
      left: column / total,
      width: span / total,
      column,
      columns: total,
      span,
      continuesBefore: segment.continuesBefore,
      continuesAfter: segment.continuesAfter
    }
  })
}

const clipTimedEvent = <TData>(
  event: FallbackTimedEvent<TData>,
  day: FallbackDay,
  timeZone: string
): Segment<TData> | undefined => {
  const touches =
    event.startEpoch < day.endEpoch &&
    (event.startEpoch >= day.startEpoch || event.endEpoch > day.startEpoch)

  if (!touches) return undefined

  const startEpoch = Math.max(event.startEpoch, day.startEpoch)
  const endEpoch = Math.min(event.endEpoch, day.endEpoch)

  const startZoned = getZonedParts(startEpoch, timeZone)
  const endZoned = getZonedParts(endEpoch, timeZone)

  const startMinute =
    startZoned.hour * 60 + startZoned.minute + startZoned.second / 60
  const endMinute =
    endZoned.dateString > day.date
      ? 1440
      : Math.max(
          startMinute,
          endZoned.hour * 60 + endZoned.minute + endZoned.second / 60
        )

  const timedEntry: TimedEntry<TData> = {
    id: event.id,
    allDay: false,
    start: event.startIso,
    end: event.endIso,
    seriesId: event.seriesId,
    recurrenceId: event.recurrenceId,
    data: event.data
  }

  return {
    event: timedEntry,
    start: startZoned.isoString,
    end: endZoned.isoString,
    startMinute,
    endMinute,
    minutes: (endEpoch - startEpoch) / 60_000,
    top: startMinute / 1440,
    height: (endMinute - startMinute) / 1440,
    continuesBefore: event.startEpoch < day.startEpoch,
    continuesAfter: event.endEpoch > day.endEpoch
  }
}

const byLaneId = <TData>(a: LaneSpan<TData>, b: LaneSpan<TData>): number => {
  if (a.event.id === b.event.id) return 0
  return a.event.id < b.event.id ? -1 : 1
}

const orderLaneSpans = <TData>(
  spans: readonly LaneSpan<TData>[]
): LaneSpan<TData>[] =>
  [...spans].sort(
    (a, b) => a.startDay - b.startDay || b.endDay - a.endDay || byLaneId(a, b)
  )

const overlapsLaneSpan = <TData>(
  a: LaneSpan<TData>,
  b: LaneSpan<TData>
): boolean => a.startDay < b.endDay && b.startDay < a.endDay

const stackLaneSpans = <TData>(
  spans: readonly LaneSpan<TData>[]
): { lanes: number; bars: CalendarBar<TData>[] } => {
  const lanes: LaneSpan<TData>[][] = []
  const placed = spans.map((span) => {
    const free = lanes.findIndex(
      (items) => !overlapsLaneSpan(last(items), span)
    )

    if (free === -1) {
      const lane = lanes.length
      lanes.push([span])
      return { span, lane }
    }

    lanes[free].push(span)
    return { span, lane: free }
  })

  return {
    lanes: lanes.length,
    bars: placed.map(({ span, lane }) => ({
      ...span,
      lane,
      lanes: lanes.length
    }))
  }
}

const chunk = <T>(items: readonly T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, index * size + size)
  )

export const buildFallbackLayout = <TData>(
  view: ViewKind,
  days: readonly FallbackDay[],
  events: readonly FallbackEvent<TData>[],
  timeZone: string
): {
  days: CalendarDay<TData>[]
  rows: CalendarRow<TData>[]
} => {
  const gridEvents: FallbackTimedEvent<TData>[] = []
  const laneEvents: FallbackEvent<TData>[] = []

  for (const event of events) {
    if (isTimed(event) && !isLaneEvent(event, timeZone)) {
      gridEvents.push(event)
    } else {
      laneEvents.push(event)
    }
  }

  const calendarDays: CalendarDay<TData>[] = days.map((day) => {
    const segments: Segment<TData>[] = []
    for (const event of gridEvents) {
      const segment = clipTimedEvent(event, day, timeZone)
      if (segment) segments.push(segment)
    }

    const boxes = clusterSegments(orderSegments(segments)).flatMap(
      placeSegments
    )

    return {
      date: day.date,
      start: day.startIso,
      end: day.endIso,
      minutes: day.minutes,
      inCurrentPeriod: day.inCurrentPeriod,
      slots: day.slots,
      boxes
    }
  })

  const dayRows = view === 'month' ? chunk(days, 7) : [days]

  const calendarRows: CalendarRow<TData>[] = dayRows.map((rowDays) => {
    const spans: LaneSpan<TData>[] = []

    for (const event of laneEvents) {
      const coversDay = (day: FallbackDay): boolean => {
        if (isAllDay(event)) {
          return event.start <= day.date && event.end > day.date
        }
        return (
          event.startEpoch < day.endEpoch && event.endEpoch > day.startEpoch
        )
      }

      const startDay = rowDays.findIndex(coversDay)
      if (startDay === -1) continue

      let covered = 0
      for (
        let idx = startDay;
        idx < rowDays.length && coversDay(rowDays[idx]);
        idx += 1
      ) {
        covered += 1
      }

      const endDay = startDay + covered
      const continuesBefore = isAllDay(event)
        ? event.start < rowDays[0].date
        : event.startEpoch < rowDays[0].startEpoch
      const continuesAfter = isAllDay(event)
        ? event.end > addDaysToDate(last(rowDays).date, 1)
        : event.endEpoch > last(rowDays).endEpoch

      const eventEntry: CalendarEntry<TData> = isAllDay(event)
        ? {
            id: event.id,
            allDay: true,
            start: event.start,
            end: event.end,
            seriesId: event.seriesId,
            recurrenceId: event.recurrenceId,
            data: event.data
          }
        : {
            id: event.id,
            allDay: false,
            start: event.startIso,
            end: event.endIso,
            seriesId: event.seriesId,
            recurrenceId: event.recurrenceId,
            data: event.data
          }

      spans.push({
        event: eventEntry,
        start: rowDays[startDay].date,
        end: addDaysToDate(rowDays[startDay].date, covered),
        startDay,
        endDay,
        dayCount: covered,
        left: startDay / rowDays.length,
        width: covered / rowDays.length,
        continuesBefore,
        continuesAfter
      })
    }

    const { lanes, bars } = stackLaneSpans(orderLaneSpans(spans))

    return {
      start: rowDays[0].date,
      end: addDaysToDate(rowDays[0].date, rowDays.length),
      dayCount: rowDays.length,
      lanes,
      bars
    }
  })

  return {
    days: calendarDays,
    rows: calendarRows
  }
}
