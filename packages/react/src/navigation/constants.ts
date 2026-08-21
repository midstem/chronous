import type { ViewKind } from '@midstem/chronous'

export const MONTH_VIEW: ViewKind = 'month'

export const SINGLE_DAY = 1

export const ISO_LOCALE = 'en-US'

export const ISO_DATE_LENGTH = 10

export const DAY_START_SUFFIX = 'T00:00:00Z'

export const DATE_PART_SEPARATOR = '-'

export const DATE_PART_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}
