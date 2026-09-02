import {
  ABSOLUTE_INSTANT_PATTERN,
  BRACKETED_ZONE_PATTERN,
  DATE_ONLY_PATTERN,
  DAY_UNIT,
  DEFAULT_DISAMBIGUATION,
  FIRST_DAY_OF_MONTH,
  FIRST_MONTH_INDEX,
  MILLISECONDS_IN_MINUTE,
  MINUTES_IN_HOUR,
  SECONDS_IN_MINUTE,
  SMALLEST_ISO_UNIT,
  UTC_TIME_ZONE
} from './constants'
import {
  compareDates,
  compareMoments,
  daysSinceWeekStart,
  getFormatter,
  isMoment,
  isoZoneOf,
  parsedDuration,
  timeZoneOf,
  toFormattable,
  wallDay
} from './helpers'
import { ensureTemporal, requireTemporal } from './temporal'
import type {
  CalendarDate,
  CompareResult,
  Disambiguation,
  FormatOptions,
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

export const compare = <T extends TimePoint>(a: T, b: T): CompareResult =>
  isMoment(a) && isMoment(b) ? compareMoments(a, b) : compareDates(a, b)

export const startOfDay = (moment: Moment): Moment => moment.startOfDay()

export const startOfWeek = (
  moment: Moment,
  weekStartsOn: WeekStartsOn
): Moment =>
  moment
    .subtract({ days: daysSinceWeekStart(moment.dayOfWeek, weekStartsOn) })
    .startOfDay()

export const startOfWeekDate = (
  date: CalendarDate,
  weekStartsOn: WeekStartsOn
): CalendarDate =>
  date.subtract({ days: daysSinceWeekStart(date.dayOfWeek, weekStartsOn) })

export const startOfMonth = (date: CalendarDate): CalendarDate =>
  date.with({ day: FIRST_DAY_OF_MONTH })

export const dayStart = (date: CalendarDate, timeZone: TimeZoneId): Moment =>
  date.toZonedDateTime(timeZone)

export const atWallTime = (
  date: CalendarDate,
  minuteOfDay: number,
  timeZone: TimeZoneId,
  disambiguation: Disambiguation = DEFAULT_DISAMBIGUATION
): Moment =>
  date
    .toPlainDateTime()
    .add({ minutes: minuteOfDay })
    .toZonedDateTime(timeZone, { disambiguation })

export const daysBetween = (from: CalendarDate, to: CalendarDate): number =>
  wallDay(to) - wallDay(from)

export const dayOfWeek = (date: CalendarDate): number => date.dayOfWeek

export const dayOfMonth = (date: CalendarDate): number => date.day

export const monthOfYear = (date: CalendarDate): number => date.month

export const yearOf = (date: CalendarDate): number => date.year

export const daysInMonth = (date: CalendarDate): number => date.daysInMonth

export const startOfYear = (date: CalendarDate): CalendarDate =>
  date.with({ month: FIRST_MONTH_INDEX, day: FIRST_DAY_OF_MONTH })

export const withMonthOfYear = (
  date: CalendarDate,
  month: number
): CalendarDate => date.with({ day: FIRST_DAY_OF_MONTH }).with({ month })

export const withDayOfMonth = (date: CalendarDate, day: number): CalendarDate =>
  date.with({ day })

export const atWallTimeOf = (
  date: CalendarDate,
  moment: Moment,
  timeZone: TimeZoneId,
  disambiguation: Disambiguation = DEFAULT_DISAMBIGUATION
): Moment =>
  date
    .toPlainDateTime(moment.toPlainTime())
    .toZonedDateTime(timeZone, { disambiguation })

export const addWallSpan = (
  moment: Moment,
  span: TimeSpan,
  timeZone: TimeZoneId,
  disambiguation: Disambiguation = DEFAULT_DISAMBIGUATION
): Moment =>
  moment
    .toPlainDateTime()
    .add(span)
    .toZonedDateTime(timeZone, { disambiguation })

export const wallSpanBetween = (from: Moment, to: Moment): TimeSpan =>
  from.toPlainDateTime().until(to.toPlainDateTime(), { largestUnit: DAY_UNIT })

export const spanToIso = (span: TimeSpan): string => span.toString()

export const withTimeZone = (moment: Moment, timeZone: TimeZoneId): Moment =>
  timeZoneOf(moment) === timeZone ? moment : moment.withTimeZone(timeZone)

export const duration = (input: TimeSpanLike | string): TimeSpan =>
  typeof input === 'string'
    ? parsedDuration(input)
    : requireTemporal().Duration.from(input)

export const format = (value: TimePoint, range: FormatOptions): string => {
  const timeZone = isMoment(value)
    ? (range.timeZone ?? timeZoneOf(value))
    : UTC_TIME_ZONE

  return getFormatter(range.locale, timeZone, range.options ?? {}).format(
    toFormattable(value)
  )
}

export const formatIso = (value: IsoDateTime, range: FormatOptions): string => {
  if (isDateOnly(value)) return format(plainDate(value), range)

  const timeZone = range.timeZone ?? isoZoneOf(value) ?? UTC_TIME_ZONE

  return format(zoned(value, timeZone), { ...range, timeZone })
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

export const minuteOfDay = (moment: Moment): number =>
  moment.hour * MINUTES_IN_HOUR +
  moment.minute +
  moment.second / SECONDS_IN_MINUTE

export { timeZoneOf, wallDay } from './helpers'

export { DAYS_IN_WEEK, MINUTES_IN_DAY } from './constants'

export type * from './types'

export { ensureTemporal, requireTemporal }

export { MissingTemporalError } from './errors'
