import type { EventId } from '#src/event'
import type { IsoDateTime, WeekStartsOn } from '#src/time'

import {
  BY_DAY_PATTERN,
  COMPACT_DATE_PATTERN,
  COMPACT_DATE_TIME_PATTERN,
  COUNT_WITH_UNTIL_REASON,
  DEFAULT_INTERVAL,
  DEFAULT_WEEK_STARTS_ON,
  EMPTY_RULE_REASON,
  FREQUENCIES,
  LIST_SEPARATOR,
  MAX_MONTH,
  MAX_MONTH_DAY,
  MIN_COUNT,
  MIN_INTERVAL,
  MIN_MONTH,
  MISSING_FREQUENCY_REASON,
  ORDINAL_FREQUENCIES,
  PAIR_SEPARATOR,
  PART_SEPARATOR,
  RULE_PREFIX,
  SUPPORTED_PARTS,
  WEEK_STARTS_ON_BY_DAY,
  malformedPartReason,
  unsupportedPartReason
} from './constants'
import { InvalidRecurrenceError } from './errors'
import type { ByDay, Frequency, RecurrenceRule, WeekDay } from './types'

const INTEGER_PATTERN = /^[+-]?\d+$/

const partsOf = (rule: string): Map<string, string> =>
  new Map(
    rule
      .replace(RULE_PREFIX, '')
      .split(PART_SEPARATOR)
      .filter((part) => part.trim() !== '')
      .map((part) => {
        const at = part.indexOf(PAIR_SEPARATOR)

        return at < 0
          ? [part.trim().toUpperCase(), '']
          : [part.slice(0, at).trim().toUpperCase(), part.slice(at + 1).trim()]
      })
  )

const fail = (eventId: EventId, reason: string): never => {
  throw new InvalidRecurrenceError(eventId, reason)
}

const readInteger = (eventId: EventId, part: string, value: string): number => {
  if (!INTEGER_PATTERN.test(value))
    fail(eventId, malformedPartReason(part, value))

  return Number(value)
}

const readList = (value: string): string[] =>
  value
    .split(LIST_SEPARATOR)
    .map((item) => item.trim())
    .filter((item) => item !== '')

const readBounded = (
  eventId: EventId,
  part: string,
  value: string,
  min: number,
  max: number
): number => {
  const parsed = readInteger(eventId, part, value)

  if (parsed < min || parsed > max)
    fail(eventId, malformedPartReason(part, value))

  return parsed
}

const readSigned = (
  eventId: EventId,
  part: string,
  value: string,
  max: number
): number => {
  const parsed = readInteger(eventId, part, value)
  const size = Math.abs(parsed)

  if (parsed === 0 || size > max)
    fail(eventId, malformedPartReason(part, value))

  return parsed
}

const readFrequency = (eventId: EventId, value: string): Frequency => {
  const upper = value.toUpperCase() as Frequency

  if (!FREQUENCIES.includes(upper))
    fail(eventId, malformedPartReason('FREQ', value))

  return upper
}

const readWeekDay = (
  eventId: EventId,
  part: string,
  value: string
): WeekDay => {
  const upper = value.toUpperCase()

  if (!(upper in WEEK_STARTS_ON_BY_DAY))
    fail(eventId, malformedPartReason(part, value))

  return upper as WeekDay
}

const readByDay = (eventId: EventId, value: string): ByDay => {
  const matched = BY_DAY_PATTERN.exec(value.toUpperCase())

  if (!matched) fail(eventId, malformedPartReason('BYDAY', value))

  const [, ordinal, weekday] = matched as RegExpExecArray

  if (ordinal !== undefined && Number(ordinal) === 0)
    fail(eventId, malformedPartReason('BYDAY', value))

  return ordinal === undefined
    ? { weekday: weekday as WeekDay }
    : { weekday: weekday as WeekDay, ordinal: Number(ordinal) }
}

const readUntil = (value: string): IsoDateTime => {
  const timed = COMPACT_DATE_TIME_PATTERN.exec(value)

  if (timed) {
    const [, year, month, day, hour, minute, second, zulu] = timed

    return `${year}-${month}-${day}T${hour}:${minute}:${second}${zulu}`
  }

  const dated = COMPACT_DATE_PATTERN.exec(value)

  if (dated) return `${dated[1]}-${dated[2]}-${dated[3]}`

  return value
}

const readWeekStart = (
  eventId: EventId,
  parts: Map<string, string>
): WeekStartsOn => {
  const value = parts.get('WKST')

  if (value === undefined) return DEFAULT_WEEK_STARTS_ON

  return WEEK_STARTS_ON_BY_DAY[readWeekDay(eventId, 'WKST', value)]
}

const readInterval = (eventId: EventId, parts: Map<string, string>): number => {
  const value = parts.get('INTERVAL')

  if (value === undefined) return DEFAULT_INTERVAL

  const parsed = readInteger(eventId, 'INTERVAL', value)

  if (parsed < MIN_INTERVAL)
    fail(eventId, malformedPartReason('INTERVAL', value))

  return parsed
}

const readCount = (
  eventId: EventId,
  parts: Map<string, string>
): number | undefined => {
  const value = parts.get('COUNT')

  if (value === undefined) return undefined

  const parsed = readInteger(eventId, 'COUNT', value)

  if (parsed < MIN_COUNT) fail(eventId, malformedPartReason('COUNT', value))

  return parsed
}

const listOf = <TItem>(
  parts: Map<string, string>,
  part: string,
  read: (value: string) => TItem
): TItem[] => readList(parts.get(part) ?? '').map(read)

const guardParts = (eventId: EventId, parts: Map<string, string>): void => {
  for (const part of parts.keys())
    if (!SUPPORTED_PARTS.includes(part))
      fail(eventId, unsupportedPartReason(part))
}

const guardRule = (eventId: EventId, rule: RecurrenceRule): void => {
  if (rule.count !== undefined && rule.until !== undefined)
    fail(eventId, COUNT_WITH_UNTIL_REASON)

  if (
    !ORDINAL_FREQUENCIES.includes(rule.frequency) &&
    rule.byDay.some((item) => item.ordinal !== undefined)
  )
    fail(
      eventId,
      unsupportedPartReason(`BYDAY ordinals with FREQ=${rule.frequency}`)
    )

  if (rule.frequency === 'WEEKLY' && rule.byMonthDay.length > 0)
    fail(eventId, unsupportedPartReason('BYMONTHDAY with FREQ=WEEKLY'))
}

export const parseRule = (eventId: EventId, rule: string): RecurrenceRule => {
  const parts = partsOf(rule)

  if (parts.size === 0) fail(eventId, EMPTY_RULE_REASON)

  guardParts(eventId, parts)

  const frequency = parts.get('FREQ')

  if (frequency === undefined) fail(eventId, MISSING_FREQUENCY_REASON)

  const until = parts.get('UNTIL')
  const parsed: RecurrenceRule = {
    frequency: readFrequency(eventId, frequency as string),
    interval: readInterval(eventId, parts),
    count: readCount(eventId, parts),
    until: until === undefined ? undefined : readUntil(until),
    byDay: listOf(parts, 'BYDAY', (value) => readByDay(eventId, value)),
    byMonthDay: listOf(parts, 'BYMONTHDAY', (value) =>
      readSigned(eventId, 'BYMONTHDAY', value, MAX_MONTH_DAY)
    ),
    byMonth: listOf(parts, 'BYMONTH', (value) =>
      readBounded(eventId, 'BYMONTH', value, MIN_MONTH, MAX_MONTH)
    ),
    bySetPos: listOf(parts, 'BYSETPOS', (value) =>
      readSigned(eventId, 'BYSETPOS', value, Number.MAX_SAFE_INTEGER)
    ),
    weekStartsOn: readWeekStart(eventId, parts)
  }

  guardRule(eventId, parsed)

  return parsed
}
