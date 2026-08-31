import { InvalidRangeError, readAnchor, spanLength } from '#src/range'
import type { CalendarRange } from '#src/range'
import { add, startOfMonth, toCalendarDate, toIso, zoned } from '#src/time'
import type { IsoDate, IsoDateTime, TimeZoneId } from '#src/time'

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
  const anchor = readAnchor(range.date)

  if (range.view === MONTH_VIEW)
    return toIso(add(startOfMonth(anchor), { months: direction }))

  return toIso(add(anchor, { days: direction * stepDays(range) }))
}

export const dateAt = (now: IsoDateTime, timeZone: TimeZoneId): IsoDate => {
  try {
    return toIso(toCalendarDate(zoned(now, timeZone)))
  } catch (cause) {
    throw new InvalidRangeError(UNREADABLE_MOMENT_REASON, cause)
  }
}
