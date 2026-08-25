import { InvalidRangeError, readAnchor, spanLength } from '#src/range'
import type { RangeSpec } from '#src/range'
import { add, startOfMonth, toCalendarDate, toIso, zoned } from '#src/time'
import type { IsoDate, IsoDateTime, TimeZoneId } from '#src/time'

import {
  MONTH_VIEW,
  STEP_DAYS_BY_VIEW,
  UNREADABLE_MOMENT_REASON
} from './constants'

const stepDays = (spec: RangeSpec): number =>
  STEP_DAYS_BY_VIEW[spec.view] ?? spanLength(spec)

export const shiftedDate = (spec: RangeSpec, direction: number): IsoDate => {
  const anchor = readAnchor(spec.date)

  if (spec.view === MONTH_VIEW)
    return toIso(add(startOfMonth(anchor), { months: direction }))

  return toIso(add(anchor, { days: direction * stepDays(spec) }))
}

export const dateAt = (now: IsoDateTime, timeZone: TimeZoneId): IsoDate => {
  try {
    return toIso(toCalendarDate(zoned(now, timeZone)))
  } catch (cause) {
    throw new InvalidRangeError(UNREADABLE_MOMENT_REASON, cause)
  }
}
