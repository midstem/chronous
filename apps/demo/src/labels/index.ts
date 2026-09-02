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

export const formatDay = labelWith(DAY_OPTIONS)

export const formatTime = labelWith(TIME_OPTIONS)

export const formatWeekday = labelWith(WEEKDAY_OPTIONS)

export const formatNumber = labelWith(NUMBER_OPTIONS)

export const formatTitle = labelWith(TITLE_OPTIONS)

export const formatMonth = labelWith(MONTH_OPTIONS)

export const formatShort = labelWith(SHORT_OPTIONS)
