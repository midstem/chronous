import type { WeekStartsOn } from '#src/time'

import type { Frequency, WeekDay } from './types'

export const RULE_PREFIX = /^RRULE:/i

export const PART_SEPARATOR = ';'

export const PAIR_SEPARATOR = '='

export const LIST_SEPARATOR = ','

export const INSTANCE_SEPARATOR = '__'

export const DEFAULT_INTERVAL = 1

export const DEFAULT_WEEK_STARTS_ON: WeekStartsOn = 1

export const MAX_EMPTY_PERIODS = 500

export const FREQUENCIES: readonly Frequency[] = [
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'YEARLY'
]

export const ORDINAL_FREQUENCIES: readonly Frequency[] = ['MONTHLY', 'YEARLY']

export const ISO_WEEKDAY: Record<WeekDay, number> = {
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
  SU: 7
}

export const WEEK_STARTS_ON_BY_DAY: Record<WeekDay, WeekStartsOn> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6
}

export const SUPPORTED_PARTS: readonly string[] = [
  'FREQ',
  'INTERVAL',
  'COUNT',
  'UNTIL',
  'BYDAY',
  'BYMONTHDAY',
  'BYMONTH',
  'BYSETPOS',
  'WKST'
]

export const BY_DAY_PATTERN = /^([+-]?\d{1,2})?(MO|TU|WE|TH|FR|SA|SU)$/

export const COMPACT_DATE_PATTERN = /^(\d{4})(\d{2})(\d{2})$/

export const COMPACT_DATE_TIME_PATTERN =
  /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/

export const MIN_INTERVAL = 1

export const MIN_COUNT = 1

export const MIN_MONTH = 1

export const MAX_MONTH = 12

export const MONTHS_IN_YEAR = 12

export const MIN_MONTH_DAY = 1

export const MAX_MONTH_DAY = 31

export const MISSING_FREQUENCY_REASON = 'has no FREQ'

export const COUNT_WITH_UNTIL_REASON = 'has both COUNT and UNTIL'

export const EMPTY_RULE_REASON = 'is empty'

export const unsupportedPartReason = (part: string): string =>
  `uses the unsupported part ${part}`

export const malformedPartReason = (part: string, value: string): string =>
  `has a malformed ${part} value "${value}"`

export const unreadableDateReason = (value: string): string =>
  `has an unreadable date "${value}"`
