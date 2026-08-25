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
import type { DateRange, RangeDay, RangeSpec, ResolvedSpec } from './types'

const resolveSpec = (spec: RangeSpec): ResolvedSpec => ({
  timeZone: requireTimeZone(spec.timeZone),
  weekStartsOn: spec.weekStartsOn ?? DEFAULT_WEEK_STARTS_ON,
  disambiguation: spec.disambiguation,
  slotMinutes: requireSlotMinutes(spec.slotMinutes ?? DEFAULT_SLOT_MINUTES),
  slotted: SLOTTED_VIEWS.includes(spec.view)
})

const spanLength = (spec: RangeSpec): number => {
  const fallback =
    spec.view === 'agenda' ? DEFAULT_AGENDA_DAYS : DEFAULT_SPAN_DAYS

  return requireDayCount(spec.dayCount ?? fallback)
}

const anchoredDates = (
  anchor: CalendarDate,
  spec: RangeSpec,
  resolved: ResolvedSpec
): CalendarDate[] => {
  if (spec.view === 'day') return [anchor]

  if (spec.view === 'week')
    return sequence(
      startOfWeekDate(anchor, resolved.weekStartsOn),
      DAYS_IN_WEEK
    )

  return sequence(anchor, spanLength(spec))
}

const monthDays = (
  anchor: CalendarDate,
  resolved: ResolvedSpec
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

export const buildRange = (spec: RangeSpec): DateRange => {
  const resolved = resolveSpec(spec)
  const anchor = readAnchor(spec.date)
  const days =
    spec.view === 'month'
      ? monthDays(anchor, resolved)
      : anchoredDates(anchor, spec, resolved).map((date) =>
          buildDay(date, resolved, true)
        )

  return {
    view: spec.view,
    start: days[0].start,
    end: days[days.length - 1].end,
    days
  }
}

export { InvalidRangeError } from './errors'

export type * from './types'
