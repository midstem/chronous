import type { Disambiguation } from './types'

export const MISSING_TEMPORAL_MESSAGE =
  'Temporal is not available in this runtime. Load a Temporal polyfill before using @midstem/chronous.'

export const ABSOLUTE_INSTANT_PATTERN = /(Z|[+-]\d{2}:?\d{2})(\[[^\]]+\])?$/i

export const DATE_ONLY_PATTERN = /^[+-]?\d{4,6}-\d{2}-\d{2}$/

export const DEFAULT_DISAMBIGUATION: Disambiguation = 'compatible'

export const DAYS_IN_WEEK = 7

export const SUNDAY_WEEK_START = 0

export const ISO_SUNDAY = 7

export const MILLISECONDS_IN_MINUTE = 60_000

export const MINUTES_IN_HOUR = 60

export const SECONDS_IN_MINUTE = 60

export const UTC_TIME_ZONE = 'UTC'

export const FORMAT_CACHE_LIMIT = 64

export const ZONE_ANNOTATION_PATTERN = /\[([^\]=!]+)\]$/

export const BRACKETED_ZONE_PATTERN = /\[[^\]=!]+\]$/

export const SMALLEST_ISO_UNIT = 'second' as const

export const FIRST_MONTH_INDEX = 1

export const MINUTES_IN_DAY = 1440

export const FIRST_DAY_OF_MONTH = 1

export const DAY_UNIT = 'day' as const
