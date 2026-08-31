import { formatIso } from '@midstem/chronous-react'
import type {
  DateTimeFormatOptions,
  IsoDateTime,
  LocaleId
} from '@midstem/chronous-react'

const DAY_OPTIONS: DateTimeFormatOptions = {
  weekday: 'short',
  day: 'numeric',
  month: 'short'
}

const TIME_OPTIONS: DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit'
}

const WEEKDAY_OPTIONS: DateTimeFormatOptions = { weekday: 'short' }

const NUMBER_OPTIONS: DateTimeFormatOptions = { day: 'numeric' }

const TITLE_OPTIONS: DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
}

const MONTH_OPTIONS: DateTimeFormatOptions = { month: 'long', year: 'numeric' }

const SHORT_OPTIONS: DateTimeFormatOptions = { day: 'numeric', month: 'short' }

const labelWith =
  (
    options: DateTimeFormatOptions
  ): ((at: IsoDateTime, locale: LocaleId) => string) =>
  (at, locale) => {
    try {
      return formatIso(at, { locale, options })
    } catch {
      return at
    }
  }

export const dayLabel = labelWith(DAY_OPTIONS)

export const timeLabel = labelWith(TIME_OPTIONS)

export const weekdayLabel = labelWith(WEEKDAY_OPTIONS)

export const numberLabel = labelWith(NUMBER_OPTIONS)

export const titleLabel = labelWith(TITLE_OPTIONS)

export const monthLabel = labelWith(MONTH_OPTIONS)

export const shortLabel = labelWith(SHORT_OPTIONS)
