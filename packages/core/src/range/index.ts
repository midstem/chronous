import {
  DAYS_IN_WEEK,
  add,
  compare,
  daysBetween,
  startOfMonth,
  startOfWeekDate
} from '#src/time'
import type { CalendarDate } from '#src/time'

import {
  DEFAULT_AGENDA_DAYS,
  DEFAULT_SLOT_MINUTES,
  DEFAULT_SPAN_DAYS,
  DEFAULT_WEEK_STARTS_ON,
  ONE_MONTH,
  SLOTTED_VIEWS
} from './constants'
import {
  buildDay,
  readAnchor,
  requireDayCount,
  requireSlotMinutes,
  requireTimeZone,
  sequence
} from './helpers'
import type { DateRange, RangeDay, CalendarRange, ResolvedRange } from './types'

const resolveRange = (range: CalendarRange): ResolvedRange => ({
  timeZone: requireTimeZone(range.timeZone),
  weekStartsOn: range.weekStartsOn ?? DEFAULT_WEEK_STARTS_ON,
  slotMinutes: requireSlotMinutes(range.slotMinutes ?? DEFAULT_SLOT_MINUTES),
  slotted: SLOTTED_VIEWS.includes(range.view)
})

export const spanLength = (range: CalendarRange): number => {
  const fallback =
    range.view === 'agenda' ? DEFAULT_AGENDA_DAYS : DEFAULT_SPAN_DAYS

  return requireDayCount(range.dayCount ?? fallback)
}

const anchoredDates = (
  anchor: CalendarDate,
  range: CalendarRange,
  resolved: ResolvedRange
): CalendarDate[] => {
  if (range.view === 'day') return [anchor]

  if (range.view === 'week')
    return sequence(
      startOfWeekDate(anchor, resolved.weekStartsOn),
      DAYS_IN_WEEK
    )

  return sequence(anchor, spanLength(range))
}

const monthDays = (
  anchor: CalendarDate,
  resolved: ResolvedRange
): RangeDay[] => {
  const monthStart = startOfMonth(anchor)
  const monthEnd = add(monthStart, ONE_MONTH)
  const gridStart = startOfWeekDate(monthStart, resolved.weekStartsOn)
  const span = daysBetween(gridStart, monthEnd)
  const count = Math.ceil(span / DAYS_IN_WEEK) * DAYS_IN_WEEK

  return sequence(gridStart, count).map((date) =>
    buildDay(
      date,
      resolved,
      compare(date, monthStart) >= 0 && compare(date, monthEnd) < 0
    )
  )
}

export const buildRange = (range: CalendarRange): DateRange => {
  const resolved = resolveRange(range)
  const anchor = readAnchor(range.date)
  const days =
    range.view === 'month'
      ? monthDays(anchor, resolved)
      : anchoredDates(anchor, range, resolved).map((date) =>
          buildDay(date, resolved, true)
        )

  return {
    view: range.view,
    start: days[0].start,
    end: days[days.length - 1].end,
    days
  }
}

export { readAnchor } from './helpers'

export { InvalidRangeError } from './errors'

export type * from './types'
