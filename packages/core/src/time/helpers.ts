import {
  ABSOLUTE_INSTANT_PATTERN,
  DAYS_IN_WEEK,
  DURATION_CACHE_LIMIT,
  FIRST_MONTH_INDEX,
  FORMAT_CACHE_LIMIT,
  ISO_SUNDAY,
  MILLISECONDS_IN_DAY,
  OFFSET_HOUR_END,
  OFFSET_SEPARATOR,
  SUNDAY_WEEK_START,
  UTC_DESIGNATOR_PATTERN,
  UTC_TIME_ZONE,
  ZONE_ANNOTATION_PATTERN
} from './constants'
import { requireTemporal } from './temporal'
import type {
  CompareResult,
  DateFields,
  DateTimeFormatOptions,
  IsoDateTime,
  LocaleId,
  Moment,
  TimePoint,
  TimeSpan,
  TimeZoneId,
  WeekStartsOn
} from './types'

const formatterCache = new Map<string, Intl.DateTimeFormat>()

const durationCache = new Map<string, TimeSpan>()

export const isMoment = (value: TimePoint): value is Moment =>
  'epochMilliseconds' in value

export const daysSinceWeekStart = (
  dayOfWeek: number,
  weekStartsOn: WeekStartsOn
): number => {
  const isoWeekStart =
    weekStartsOn === SUNDAY_WEEK_START ? ISO_SUNDAY : weekStartsOn

  return (dayOfWeek - isoWeekStart + DAYS_IN_WEEK) % DAYS_IN_WEEK
}

export const timeZoneOf = (moment: Moment): TimeZoneId => {
  const declared = (moment as { timeZoneId?: TimeZoneId }).timeZoneId

  if (declared) return declared

  return ZONE_ANNOTATION_PATTERN.exec(moment.toString())?.[1] ?? UTC_TIME_ZONE
}

const withOffsetSeparator = (offset: string): TimeZoneId =>
  offset.includes(OFFSET_SEPARATOR)
    ? offset
    : `${offset.slice(0, OFFSET_HOUR_END)}${OFFSET_SEPARATOR}${offset.slice(OFFSET_HOUR_END)}`

export const isoZoneOf = (iso: IsoDateTime): TimeZoneId | null => {
  const annotated = ZONE_ANNOTATION_PATTERN.exec(iso)?.[1]

  if (annotated) return annotated

  const offset = ABSOLUTE_INSTANT_PATTERN.exec(iso)?.[1]

  if (!offset) return null

  return UTC_DESIGNATOR_PATTERN.test(offset)
    ? UTC_TIME_ZONE
    : withOffsetSeparator(offset)
}

export const getFormatter = (
  locale: LocaleId,
  timeZone: TimeZoneId,
  options: DateTimeFormatOptions
): Intl.DateTimeFormat => {
  const key = `${locale}|${timeZone}|${JSON.stringify(options)}`
  const cached = formatterCache.get(key)

  if (cached) return cached

  const formatter = new Intl.DateTimeFormat(locale, { ...options, timeZone })

  if (formatterCache.size >= FORMAT_CACHE_LIMIT) formatterCache.clear()
  formatterCache.set(key, formatter)

  return formatter
}

export const parsedDuration = (input: string): TimeSpan => {
  const cached = durationCache.get(input)

  if (cached) return cached

  const parsed = requireTemporal().Duration.from(input)

  if (durationCache.size >= DURATION_CACHE_LIMIT) durationCache.clear()
  durationCache.set(input, parsed)

  return parsed
}

const utcDateOf = (value: DateFields): Date => {
  const date = new Date(0)

  date.setUTCFullYear(value.year, value.month - FIRST_MONTH_INDEX, value.day)

  return date
}

export const wallDay = (value: DateFields): number =>
  utcDateOf(value).getTime() / MILLISECONDS_IN_DAY

const orderOf = (difference: number): CompareResult => {
  if (difference < 0) return -1

  return difference > 0 ? 1 : 0
}

export const compareMoments = (a: Moment, b: Moment): CompareResult => {
  const left = a.epochNanoseconds
  const right = b.epochNanoseconds

  if (left < right) return -1

  return left > right ? 1 : 0
}

export const compareDates = (a: DateFields, b: DateFields): CompareResult =>
  orderOf(wallDay(a) - wallDay(b))

export const toFormattable = (value: TimePoint): Date =>
  isMoment(value) ? new Date(value.epochMilliseconds) : utcDateOf(value)
