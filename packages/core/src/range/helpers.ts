import {
  MINUTES_IN_DAY,
  add,
  atWallTime,
  compare,
  dayStart,
  minutesBetween,
  plainDate
} from '#src/time'
import type { CalendarDate, IsoDate, Moment } from '#src/time'

import {
  INVALID_DAY_COUNT_REASON,
  INVALID_SLOT_MINUTES_REASON,
  MAX_SLOT_MINUTES,
  MIN_DAY_COUNT,
  MIN_SLOT_MINUTES,
  SINGLE_DAY,
  UNREADABLE_DATE_REASON
} from './constants'
import { InvalidRangeError } from './errors'
import type { DaySlot, RangeDay, ResolvedSpec } from './types'

export const readAnchor = (iso: IsoDate): CalendarDate => {
  try {
    return plainDate(iso)
  } catch (cause) {
    throw new InvalidRangeError(UNREADABLE_DATE_REASON, cause)
  }
}

export const requireSlotMinutes = (value: number): number => {
  if (
    !Number.isInteger(value) ||
    value < MIN_SLOT_MINUTES ||
    value > MAX_SLOT_MINUTES
  )
    throw new InvalidRangeError(INVALID_SLOT_MINUTES_REASON)

  return value
}

export const requireDayCount = (value: number): number => {
  if (!Number.isInteger(value) || value < MIN_DAY_COUNT)
    throw new InvalidRangeError(INVALID_DAY_COUNT_REASON)

  return value
}

export const sequence = (from: CalendarDate, count: number): CalendarDate[] =>
  Array.from({ length: count }, (_, index) => add(from, { days: index }))

const clampAscending = (
  starts: readonly Moment[],
  dayEnd: Moment
): Moment[] => {
  const clamped: Moment[] = []
  let ceiling = dayEnd

  for (let index = starts.length - 1; index >= 0; index -= 1) {
    const start = starts[index]

    ceiling = compare(start, ceiling) < 0 ? start : ceiling
    clamped.push(ceiling)
  }

  return clamped.reverse()
}

const buildSlots = (
  date: CalendarDate,
  dayEnd: Moment,
  spec: ResolvedSpec
): DaySlot[] => {
  const count = Math.ceil(MINUTES_IN_DAY / spec.slotMinutes)
  const starts = clampAscending(
    Array.from({ length: count }, (_, index) =>
      atWallTime(
        date,
        index * spec.slotMinutes,
        spec.timeZone,
        spec.disambiguation
      )
    ),
    dayEnd
  )

  return starts.map((start, index) => {
    const end = starts[index + 1] ?? dayEnd

    return {
      minuteOfDay: index * spec.slotMinutes,
      start,
      end,
      minutes: minutesBetween(start, end)
    }
  })
}

export const buildDay = (
  date: CalendarDate,
  spec: ResolvedSpec,
  inPeriod: boolean
): RangeDay => {
  const start = dayStart(date, spec.timeZone)
  const end = dayStart(add(date, SINGLE_DAY), spec.timeZone)

  return {
    date,
    start,
    end,
    minutes: minutesBetween(start, end),
    inPeriod,
    slots: spec.slotted ? buildSlots(date, end, spec) : []
  }
}
