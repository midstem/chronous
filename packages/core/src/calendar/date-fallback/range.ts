import { InvalidRangeError } from '#src/range'
import type { CalendarRange, ViewKind } from '#src/range'
import type { IsoDate, WeekStartsOn } from '#src/time'

import {
  addDaysToDate,
  checkTransitionDay,
  daysDifference,
  formatDateOnly,
  getZonedParts,
  isoDayOfWeek,
  parseDateOnly,
  validateTimeZone
} from './time'
import type { FallbackDay } from './types'
import { warnApproximation } from './warn'

const DEFAULT_SLOT_MINUTES = 60
const DEFAULT_WEEK_STARTS_ON: WeekStartsOn = 1
const DEFAULT_SPAN_DAYS = 7
const DEFAULT_AGENDA_DAYS = 30
const MIN_SLOT_MINUTES = 1
const MAX_SLOT_MINUTES = 1440
const MIN_DAY_COUNT = 1

const UNREADABLE_DATE_REASON = 'the anchor date cannot be read'
const INVALID_SLOT_MINUTES_REASON = `slotMinutes must be a whole number between ${MIN_SLOT_MINUTES} and ${MAX_SLOT_MINUTES}`
const INVALID_DAY_COUNT_REASON = `dayCount must be a whole number of at least ${MIN_DAY_COUNT}`

const SLOTTED_VIEWS: readonly ViewKind[] = ['day', 'week', 'days']
const VALID_VIEWS: readonly ViewKind[] = [
  'day',
  'week',
  'days',
  'month',
  'agenda'
]

const requireSlotMinutes = (value: number): number => {
  if (
    !Number.isInteger(value) ||
    value < MIN_SLOT_MINUTES ||
    value > MAX_SLOT_MINUTES
  ) {
    throw new InvalidRangeError(INVALID_SLOT_MINUTES_REASON)
  }
  return value
}

const requireDayCount = (value: number): number => {
  if (!Number.isInteger(value) || value < MIN_DAY_COUNT) {
    throw new InvalidRangeError(INVALID_DAY_COUNT_REASON)
  }
  return value
}

const startOfWeekDate = (
  date: IsoDate,
  weekStartsOn: WeekStartsOn
): IsoDate => {
  const dayOfWeek = isoDayOfWeek(date)
  const adjustedStart = weekStartsOn === 0 ? 7 : weekStartsOn
  const diff = (dayOfWeek - adjustedStart + 7) % 7
  return addDaysToDate(date, -diff)
}

export type BuiltFallbackRange = {
  view: ViewKind
  days: FallbackDay[]
  startIso: string
  endIso: string
}

export const buildFallbackRange = (
  range: CalendarRange
): BuiltFallbackRange => {
  if (!VALID_VIEWS.includes(range.view)) {
    throw new InvalidRangeError(`unsupported view "${range.view}"`)
  }

  validateTimeZone(range.timeZone)
  const slotMinutes = requireSlotMinutes(
    range.slotMinutes ?? DEFAULT_SLOT_MINUTES
  )

  const anchorParsed = parseDateOnly(
    range.currentDate,
    (cause) => new InvalidRangeError(UNREADABLE_DATE_REASON, cause)
  )
  const anchorDate = formatDateOnly(
    anchorParsed.year,
    anchorParsed.month,
    anchorParsed.day
  )

  const weekStartsOn = range.weekStartsOn ?? DEFAULT_WEEK_STARTS_ON
  const isSlotted = SLOTTED_VIEWS.includes(range.view)

  let dates: IsoDate[]
  let isDateInCurrentPeriod: (date: IsoDate) => boolean

  if (range.view === 'day') {
    dates = [anchorDate]
    isDateInCurrentPeriod = () => true
  } else if (range.view === 'week') {
    const weekStart = startOfWeekDate(anchorDate, weekStartsOn)
    dates = Array.from({ length: 7 }, (_, i) => addDaysToDate(weekStart, i))
    isDateInCurrentPeriod = () => true
  } else if (range.view === 'days' || range.view === 'agenda') {
    const fallbackCount =
      range.view === 'agenda' ? DEFAULT_AGENDA_DAYS : DEFAULT_SPAN_DAYS
    const count = requireDayCount(range.dayCount ?? fallbackCount)
    dates = Array.from({ length: count }, (_, i) =>
      addDaysToDate(anchorDate, i)
    )
    isDateInCurrentPeriod = () => true
  } else {
    // view === 'month'
    const monthStart = formatDateOnly(anchorParsed.year, anchorParsed.month, 1)
    const nextYear =
      anchorParsed.month === 12 ? anchorParsed.year + 1 : anchorParsed.year
    const nextMonth = anchorParsed.month === 12 ? 1 : anchorParsed.month + 1
    const nextMonthStart = formatDateOnly(nextYear, nextMonth, 1)

    const gridStart = startOfWeekDate(monthStart, weekStartsOn)
    const span = daysDifference(gridStart, nextMonthStart)
    const count = Math.ceil(span / 7) * 7

    dates = Array.from({ length: count }, (_, i) => addDaysToDate(gridStart, i))
    isDateInCurrentPeriod = (d) => d >= monthStart && d < nextMonthStart
  }

  const days: FallbackDay[] = dates.map((date) => {
    const check = checkTransitionDay(date, range.timeZone)
    if (check.isTransition) {
      warnApproximation(
        `transition:${range.timeZone}:${date}`,
        `The ${date} grid in ${range.timeZone} crosses a time-zone transition; Date fallback slot boundaries may differ from Temporal.`
      )
    }

    const slotCount = Math.ceil(1440 / slotMinutes)
    const slots = isSlotted
      ? Array.from({ length: slotCount }, (_, index) => {
          const minuteOfDay = index * slotMinutes
          const slotStartEpoch = Math.min(
            check.startEpoch + minuteOfDay * 60_000,
            check.endEpoch
          )
          const slotEndEpoch =
            index === slotCount - 1
              ? check.endEpoch
              : Math.max(
                  slotStartEpoch,
                  Math.min(
                    check.startEpoch + (index + 1) * slotMinutes * 60_000,
                    check.endEpoch
                  )
                )
          return {
            minuteOfDay,
            start: getZonedParts(slotStartEpoch, range.timeZone).isoString,
            end: getZonedParts(slotEndEpoch, range.timeZone).isoString,
            minutes: (slotEndEpoch - slotStartEpoch) / 60_000
          }
        })
      : []

    return {
      date,
      startEpoch: check.startEpoch,
      endEpoch: check.endEpoch,
      startIso: check.startIso,
      endIso: check.endIso,
      minutes: (check.endEpoch - check.startEpoch) / 60_000,
      inCurrentPeriod: isDateInCurrentPeriod(date),
      slots
    }
  })

  return {
    view: range.view,
    days,
    startIso: days[0].startIso,
    endIso: days[days.length - 1].endIso
  }
}
