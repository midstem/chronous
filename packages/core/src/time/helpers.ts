import {
  DAYS_IN_WEEK,
  FIRST_MONTH_INDEX,
  FORMAT_CACHE_LIMIT,
  ISO_SUNDAY,
  SUNDAY_WEEK_START,
  UTC_TIME_ZONE,
  ZONE_ANNOTATION_PATTERN
} from './constants'
import type {
  CalendarDate,
  FormatOptions,
  LocaleId,
  Moment,
  TimePoint,
  TimeZoneId,
  WeekStartsOn
} from './types'

const formatterCache = new Map<string, Intl.DateTimeFormat>()

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

export const getFormatter = (
  locale: LocaleId,
  timeZone: TimeZoneId,
  options: FormatOptions
): Intl.DateTimeFormat => {
  const key = `${locale}|${timeZone}|${JSON.stringify(options)}`
  const cached = formatterCache.get(key)

  if (cached) return cached

  const formatter = new Intl.DateTimeFormat(locale, { ...options, timeZone })

  if (formatterCache.size >= FORMAT_CACHE_LIMIT) formatterCache.clear()
  formatterCache.set(key, formatter)

  return formatter
}

const calendarDateToUtcDate = (value: CalendarDate): Date => {
  const date = new Date(0)

  date.setUTCFullYear(value.year, value.month - FIRST_MONTH_INDEX, value.day)

  return date
}

export const toFormattable = (value: TimePoint): Date =>
  isMoment(value)
    ? new Date(value.epochMilliseconds)
    : calendarDateToUtcDate(value)
