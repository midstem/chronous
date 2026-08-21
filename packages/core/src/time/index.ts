import {
  ABSOLUTE_INSTANT_PATTERN,
  BRACKETED_ZONE_PATTERN,
  DATE_ONLY_PATTERN,
  DAYS_IN_WEEK,
  DEFAULT_DISAMBIGUATION,
  ISO_SUNDAY,
  MILLISECONDS_IN_MINUTE,
  SMALLEST_ISO_UNIT,
  SUNDAY_WEEK_START,
  UTC_TIME_ZONE
} from './constants'
import { getFormatter, isMoment, timeZoneOf, toFormattable } from './helpers'
import { requireTemporal } from './temporal'
import type {
  CalendarDate,
  CompareResult,
  Disambiguation,
  FormatSpec,
  IsoDate,
  IsoDateTime,
  Moment,
  TimePoint,
  TimeSpan,
  TimeSpanLike,
  TimeZoneId,
  WeekStartsOn
} from './types'

export const zoned = (
  iso: IsoDateTime,
  timeZone: TimeZoneId,
  disambiguation: Disambiguation = DEFAULT_DISAMBIGUATION
): Moment => {
  const temporal = requireTemporal()

  if (ABSOLUTE_INSTANT_PATTERN.test(iso))
    return temporal.Instant.from(iso).toZonedDateTimeISO(timeZone)

  if (BRACKETED_ZONE_PATTERN.test(iso))
    return temporal.ZonedDateTime.from(iso, { disambiguation }).withTimeZone(
      timeZone
    )

  if (DATE_ONLY_PATTERN.test(iso))
    return temporal.PlainDate.from(iso).toZonedDateTime(timeZone)

  return temporal.PlainDateTime.from(iso).toZonedDateTime(timeZone, {
    disambiguation
  })
}

export const plainDate = (iso: IsoDate): CalendarDate =>
  requireTemporal().PlainDate.from(iso)

export const isDateOnly = (iso: IsoDateTime): boolean =>
  DATE_ONLY_PATTERN.test(iso)

export const add = <T extends TimePoint>(
  value: T,
  span: TimeSpanLike | TimeSpan
): T => value.add(span) as T

export const subtract = <T extends TimePoint>(
  value: T,
  span: TimeSpanLike | TimeSpan
): T => value.subtract(span) as T

export const compare = <T extends TimePoint>(a: T, b: T): CompareResult => {
  const temporal = requireTemporal()

  if (isMoment(a) && isMoment(b))
    return temporal.ZonedDateTime.compare(a, b) as CompareResult

  return temporal.PlainDate.compare(a, b) as CompareResult
}

export const startOfDay = (moment: Moment): Moment => moment.startOfDay()

export const startOfWeek = (
  moment: Moment,
  weekStartsOn: WeekStartsOn
): Moment => {
  const isoWeekStart =
    weekStartsOn === SUNDAY_WEEK_START ? ISO_SUNDAY : weekStartsOn
  const daysSinceWeekStart =
    (moment.dayOfWeek - isoWeekStart + DAYS_IN_WEEK) % DAYS_IN_WEEK

  return moment.subtract({ days: daysSinceWeekStart }).startOfDay()
}

export const withTimeZone = (moment: Moment, timeZone: TimeZoneId): Moment =>
  moment.withTimeZone(timeZone)

export const duration = (input: TimeSpanLike | string): TimeSpan =>
  requireTemporal().Duration.from(input)

export const format = (value: TimePoint, spec: FormatSpec): string => {
  const timeZone = isMoment(value)
    ? (spec.timeZone ?? timeZoneOf(value))
    : UTC_TIME_ZONE

  return getFormatter(spec.locale, timeZone, spec.options ?? {}).format(
    toFormattable(value)
  )
}

export const now = (timeZone: TimeZoneId): Moment =>
  requireTemporal().Now.zonedDateTimeISO(timeZone)

export const toIso = (value: TimePoint): IsoDateTime =>
  isMoment(value)
    ? value.toString({
        timeZoneName: 'never',
        smallestUnit: SMALLEST_ISO_UNIT
      })
    : value.toString()

export const toCalendarDate = (moment: Moment): CalendarDate =>
  moment.toPlainDate()

export const hoursInDay = (moment: Moment): number => moment.hoursInDay

export const minutesBetween = (from: Moment, to: Moment): number =>
  (to.epochMilliseconds - from.epochMilliseconds) / MILLISECONDS_IN_MINUTE

export { timeZoneOf } from './helpers'

export type * from './types'
