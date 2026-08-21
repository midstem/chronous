import type {
  Calendar,
  IsoDate,
  RangeSpec,
  TimeZoneId,
  ViewKind
} from '@midstem/chronous'

import {
  DATE_PART_OPTIONS,
  DATE_PART_SEPARATOR,
  DAY_START_SUFFIX,
  ISO_DATE_LENGTH,
  ISO_LOCALE,
  MONTH_VIEW,
  SINGLE_DAY
} from './constants'
import type { CalendarNavigation } from './types'

export const shift = (date: IsoDate, days: number): IsoDate => {
  const moment = new Date(`${date}${DAY_START_SUFFIX}`)

  moment.setUTCDate(moment.getUTCDate() + days)

  return moment.toISOString().slice(0, ISO_DATE_LENGTH)
}

export const todayIn = (timeZone: TimeZoneId, now: Date): IsoDate => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat(ISO_LOCALE, { ...DATE_PART_OPTIONS, timeZone })
      .formatToParts(now)
      .map((part) => [part.type, part.value])
  ) as Record<Intl.DateTimeFormatPartTypes, string>

  return [parts.year, parts.month, parts.day].join(DATE_PART_SEPARATOR)
}

const periodDates = <TData>(calendar: Calendar<TData>): IsoDate[] =>
  calendar.days.filter((day) => day.inPeriod).map((day) => day.date)

const backwardStep = (dates: readonly IsoDate[], view: ViewKind): number =>
  view === MONTH_VIEW ? SINGLE_DAY : dates.length

const stepped = (
  spec: RangeSpec,
  dates: readonly IsoDate[],
  forward: boolean
): RangeSpec => ({
  ...spec,
  date: forward
    ? shift(dates[dates.length - SINGLE_DAY], SINGLE_DAY)
    : shift(dates[0], -backwardStep(dates, spec.view))
})

export const navigationOf = <TData>(
  calendar: Calendar<TData> | null,
  spec: RangeSpec
): CalendarNavigation => {
  const dates = calendar ? periodDates(calendar) : []
  const movable = dates.length > 0

  return {
    next: movable ? stepped(spec, dates, true) : null,
    prev: movable ? stepped(spec, dates, false) : null,
    today: () => ({ ...spec, date: todayIn(spec.timeZone, new Date()) }),
    withView: (view) => ({ ...spec, view })
  }
}
