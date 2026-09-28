import { InvalidRangeError, readAnchor, spanLength } from '#src/range'
import type { CalendarRange } from '#src/range'
import { isTemporalAvailable } from '#src/runtime'
import {
  add,
  requireTemporal,
  startOfMonth,
  toCalendarDate,
  toIso,
  zoned
} from '#src/time'
import type { IsoDate, IsoDateTime } from '#src/time'

import { buildFallbackRange } from '../calendar/date-fallback/range'
import {
  addDaysToDate,
  formatDateOnly,
  getZonedParts,
  parseDateOnly,
  validateTimeZone
} from '../calendar/date-fallback/time'

import {
  MONTH_VIEW,
  STEP_DAYS_BY_VIEW,
  UNREADABLE_MOMENT_REASON
} from './constants'

const stepDays = (range: CalendarRange): number =>
  STEP_DAYS_BY_VIEW[range.view] ?? spanLength(range)

export const shiftedDate = (
  range: CalendarRange,
  direction: number
): IsoDate => {
  if (!isTemporalAvailable() && range.timeFallback === 'date') {
    const anchor = parseDateOnly(
      range.currentDate,
      (cause) => new InvalidRangeError('the anchor date cannot be read', cause)
    )
    const date =
      range.view === MONTH_VIEW
        ? (() => {
            const month = anchor.month - 1 + direction
            const year = anchor.year + Math.floor(month / 12)
            return formatDateOnly(year, (((month % 12) + 12) % 12) + 1, 1)
          })()
        : addDaysToDate(range.currentDate, direction * stepDays(range))

    buildFallbackRange({ ...range, currentDate: date })
    return date
  }

  requireTemporal()

  const anchor = readAnchor(range.currentDate)

  if (range.view === MONTH_VIEW)
    return toIso(add(startOfMonth(anchor), { months: direction }))

  return toIso(add(anchor, { days: direction * stepDays(range) }))
}

export const dateAt = (now: IsoDateTime, range: CalendarRange): IsoDate => {
  if (!isTemporalAvailable() && range.timeFallback === 'date') {
    try {
      validateTimeZone(range.timeZone)
      if (!/(Z|[+-]\d{2}:?\d{2})(\[[^\]]+\])?$/i.test(now))
        throw new RangeError('The current moment needs an explicit offset')

      const instant = new Date(now.replace(/\[[^\]]+\]$/, ''))
      if (Number.isNaN(instant.getTime()))
        throw new RangeError('Invalid ISO date')
      const date = getZonedParts(instant.getTime(), range.timeZone).dateString
      buildFallbackRange({ ...range, currentDate: date })
      return date
    } catch (cause) {
      throw new InvalidRangeError(UNREADABLE_MOMENT_REASON, cause)
    }
  }

  requireTemporal()

  try {
    return toIso(toCalendarDate(zoned(now, range.timeZone)))
  } catch (cause) {
    throw new InvalidRangeError(UNREADABLE_MOMENT_REASON, cause)
  }
}
