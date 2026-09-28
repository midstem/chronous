import { InvalidEventError } from '#src/event'
import { InvalidRangeError } from '#src/range'
import type { IsoDate, IsoDateTime } from '#src/time'

import { warnApproximation } from './warn'

const DATE_ONLY_PATTERN = /^([+-]?\d{4,6})-(\d{2})-(\d{2})$/

const FIXED_TIMED_PATTERN =
  /^([+-]?\d{4,6})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(?:(Z)|([+-])(\d{2})(?::?(\d{2}))?)$/i

const FLOATING_TIMED_PATTERN =
  /^[+-]?\d{4,6}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?(?:\[.+\])?$/i

const LOCAL_TIMED_FIELDS =
  /^([+-]?\d{4,6}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?$/

export const validateTimeZone = (timeZone: string): void => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone })
  } catch (cause) {
    throw new InvalidRangeError('the time zone cannot be read', cause)
  }
}

export const isDateOnlyString = (value: string): boolean =>
  DATE_ONLY_PATTERN.test(value)

export const isFloatingTimeString = (value: string): boolean =>
  FLOATING_TIMED_PATTERN.test(value) && !FIXED_TIMED_PATTERN.test(value)

export const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0

export const daysInMonth = (year: number, month: number): number => {
  switch (month) {
    case 2:
      return isLeapYear(year) ? 29 : 28
    case 4:
    case 6:
    case 9:
    case 11:
      return 30
    default:
      return 31
  }
}

export const parseDateOnly = (
  str: string,
  errorBuilder?: (cause: Error) => Error
): { year: number; month: number; day: number } => {
  const match = DATE_ONLY_PATTERN.exec(str)
  if (!match) {
    const err = new RangeError(`Invalid date string: "${str}"`)
    throw errorBuilder ? errorBuilder(err) : err
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  if (month < 1 || month > 12) {
    const err = new RangeError(`Invalid month: ${month}`)
    throw errorBuilder ? errorBuilder(err) : err
  }

  const maxDay = daysInMonth(year, month)
  if (day < 1 || day > maxDay) {
    const err = new RangeError(`Invalid day: ${day}`)
    throw errorBuilder ? errorBuilder(err) : err
  }

  return { year, month, day }
}

export const formatDateOnly = (
  year: number,
  month: number,
  day: number
): IsoDate => {
  const pad = (n: number): string => String(n).padStart(2, '0')
  const padYear = (y: number): string =>
    y < 0
      ? '-' + String(Math.abs(y)).padStart(4, '0')
      : String(y).padStart(4, '0')
  return `${padYear(year)}-${pad(month)}-${pad(day)}`
}

const utcEpoch = (
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0
): number => {
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  date.setUTCHours(hour, minute, second, millisecond)
  return date.getTime()
}

export const addDaysToDate = (dateStr: string, count: number): IsoDate => {
  const { year, month, day } = parseDateOnly(dateStr)
  const d = new Date(utcEpoch(year, month, day + count))
  return formatDateOnly(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate())
}

export const daysDifference = (fromStr: string, toStr: string): number => {
  const from = parseDateOnly(fromStr)
  const to = parseDateOnly(toStr)
  const msFrom = utcEpoch(from.year, from.month, from.day)
  const msTo = utcEpoch(to.year, to.month, to.day)
  return Math.round((msTo - msFrom) / 86_400_000)
}

export const isoDayOfWeek = (dateStr: string): number => {
  const { year, month, day } = parseDateOnly(dateStr)
  const dayIndex = new Date(utcEpoch(year, month, day)).getUTCDay()
  return dayIndex === 0 ? 7 : dayIndex
}

const formatterCache = new Map<string, Intl.DateTimeFormat>()

const getFormatter = (timeZone: string): Intl.DateTimeFormat => {
  let fmt = formatterCache.get(timeZone)
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    })
    formatterCache.set(timeZone, fmt)
  }
  return fmt
}

export type ZonedParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  offsetMinutes: number
  offsetString: string
  dateString: IsoDate
  isoString: IsoDateTime
}

export const getZonedParts = (
  epochMs: number,
  timeZone: string
): ZonedParts => {
  const fmt = getFormatter(timeZone)
  const parts = fmt.formatToParts(new Date(epochMs))

  let year = 0
  let month = 0
  let day = 0
  let hour = 0
  let minute = 0
  let second = 0

  for (const part of parts) {
    switch (part.type) {
      case 'year':
        year = Number(part.value)
        break
      case 'month':
        month = Number(part.value)
        break
      case 'day':
        day = Number(part.value)
        break
      case 'hour':
        hour = Number(part.value)
        break
      case 'minute':
        minute = Number(part.value)
        break
      case 'second':
        second = Number(part.value)
        break
    }
  }

  if (hour === 24) hour = 0

  const wallUtcMs = utcEpoch(year, month, day, hour, minute, second)
  const offsetMs = wallUtcMs - epochMs
  const offsetMinutes = Math.round(offsetMs / 60_000)

  const sign = offsetMinutes >= 0 ? '+' : '-'
  const absOffset = Math.abs(offsetMinutes)
  const offH = String(Math.floor(absOffset / 60)).padStart(2, '0')
  const offM = String(absOffset % 60).padStart(2, '0')
  const offsetString = `${sign}${offH}:${offM}`

  const pad = (n: number): string => String(n).padStart(2, '0')
  const padYear = (y: number): string =>
    y < 0
      ? '-' + String(Math.abs(y)).padStart(4, '0')
      : String(y).padStart(4, '0')

  const dateString = `${padYear(year)}-${pad(month)}-${pad(day)}`
  const isoString = `${dateString}T${pad(hour)}:${pad(minute)}:${pad(second)}${offsetString}`

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    offsetMinutes,
    offsetString,
    dateString,
    isoString
  }
}

export const getDayStartEpoch = (dateStr: string, timeZone: string): number => {
  const { year, month, day } = parseDateOnly(dateStr)
  let epoch = utcEpoch(year, month, day)

  for (let iter = 0; iter < 4; iter += 1) {
    const zoned = getZonedParts(epoch, timeZone)
    const diffMinutes =
      daysDifference(dateStr, zoned.dateString) * 1440 +
      zoned.hour * 60 +
      zoned.minute
    if (diffMinutes === 0 && zoned.second === 0) {
      return epoch
    }
    epoch -= diffMinutes * 60_000 + zoned.second * 1000
  }
  return epoch
}

export type TransitionCheckResult = {
  isTransition: boolean
  startEpoch: number
  endEpoch: number
  startIso: IsoDateTime
  endIso: IsoDateTime
}

const transitionCache = new Map<string, TransitionCheckResult>()

export const checkTransitionDay = (
  dateStr: string,
  timeZone: string
): TransitionCheckResult => {
  const key = `${timeZone}|${dateStr}`
  const cached = transitionCache.get(key)
  if (cached) return cached

  const nextDateStr = addDaysToDate(dateStr, 1)
  const startEpoch = getDayStartEpoch(dateStr, timeZone)
  const endEpoch = getDayStartEpoch(nextDateStr, timeZone)

  const startZoned = getZonedParts(startEpoch, timeZone)
  const endZoned = getZonedParts(endEpoch, timeZone)

  const durationMs = endEpoch - startEpoch
  const is24Hours = durationMs === 86_400_000

  const constantOffset =
    Array.from({ length: 24 }, (_, hour) =>
      getZonedParts(startEpoch + hour * 3_600_000, timeZone)
    ).every((sample) => sample.offsetMinutes === startZoned.offsetMinutes) &&
    endZoned.offsetMinutes === startZoned.offsetMinutes

  const midnightMatches =
    startZoned.dateString === dateStr &&
    startZoned.hour === 0 &&
    startZoned.minute === 0 &&
    startZoned.second === 0

  const isTransition = !is24Hours || !constantOffset || !midnightMatches

  const result = {
    isTransition,
    startEpoch,
    endEpoch,
    startIso: startZoned.isoString,
    endIso: endZoned.isoString
  }

  if (transitionCache.size >= 256) transitionCache.clear()
  transitionCache.set(key, result)
  return result
}

export const parseFixedTimedIso = (
  eventId: string,
  value: string,
  reason: string
): number => {
  if (isFloatingTimeString(value)) {
    throw new InvalidEventError(
      eventId,
      'floating times are not supported in date fallback mode'
    )
  }

  const match = FIXED_TIMED_PATTERN.exec(value)
  if (!match) {
    throw new InvalidEventError(
      eventId,
      reason,
      new RangeError(`Invalid ISO date-time: "${value}"`)
    )
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hour = Number(match[4])
  const minute = Number(match[5])
  const second = match[6] !== undefined ? Number(match[6]) : 0
  const fractionalStr = match[7]
  const ms = fractionalStr ? Math.floor(Number('0.' + fractionalStr) * 1000) : 0

  if (month < 1 || month > 12) {
    throw new InvalidEventError(
      eventId,
      reason,
      new RangeError(`Invalid month: ${month}`)
    )
  }

  const maxDay = daysInMonth(year, month)
  if (day < 1 || day > maxDay) {
    throw new InvalidEventError(
      eventId,
      reason,
      new RangeError(`Invalid day: ${day}`)
    )
  }

  if (
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59
  ) {
    throw new InvalidEventError(
      eventId,
      reason,
      new RangeError(`Invalid time: ${hour}:${minute}:${second}`)
    )
  }

  const isUtc = Boolean(match[8])
  let offsetMin = 0
  if (!isUtc) {
    const sign = match[9] === '-' ? -1 : 1
    const offH = Number(match[10])
    const offM = match[11] !== undefined ? Number(match[11]) : 0
    if (offH > 23 || offM > 59) {
      throw new InvalidEventError(
        eventId,
        reason,
        new RangeError(`Invalid time zone offset: ${match[9]}${offH}:${offM}`)
      )
    }
    offsetMin = sign * (offH * 60 + offM)
  }

  const localUtcMs = utcEpoch(year, month, day, hour, minute, second, ms)
  return localUtcMs - offsetMin * 60_000
}

export const parseTimedIso = (
  eventId: string,
  value: string,
  sourceZone: string,
  reason: string
): number => {
  const annotated = /\[([^\]]+)\]$/.exec(value)
  const zone = annotated?.[1] ?? sourceZone
  const bare = annotated ? value.slice(0, annotated.index) : value

  if (FIXED_TIMED_PATTERN.test(bare))
    return parseFixedTimedIso(eventId, bare, reason)

  if (isDateOnlyString(bare)) {
    parseDateOnly(
      bare,
      (cause) => new InvalidEventError(eventId, reason, cause)
    )
    return getDayStartEpoch(bare, zone)
  }

  const fields = LOCAL_TIMED_FIELDS.exec(bare)
  if (!fields)
    throw new InvalidEventError(
      eventId,
      reason,
      new RangeError(`Invalid ISO date-time: "${value}"`)
    )

  parseDateOnly(
    fields[1],
    (cause) => new InvalidEventError(eventId, reason, cause)
  )
  const hour = Number(fields[2])
  const minute = Number(fields[3])
  const second = fields[4] === undefined ? 0 : Number(fields[4])
  const millisecond = fields[5]
    ? Math.floor(Number(`0.${fields[5]}`) * 1000)
    : 0
  if (hour > 23 || minute > 59 || second > 59)
    throw new InvalidEventError(
      eventId,
      reason,
      new RangeError('Invalid wall time')
    )

  const day = checkTransitionDay(fields[1], zone)
  if (day.isTransition) {
    warnApproximation(
      `wall:${zone}:${fields[1]}`,
      `Wall times on ${fields[1]} in ${zone} are approximate in Date fallback.`
    )
  }

  return (
    day.startEpoch + ((hour * 60 + minute) * 60 + second) * 1000 + millisecond
  )
}
