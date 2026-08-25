import { formatIso } from '@midstem/chronous'
import type { FormatOptions, IsoDateTime, LocaleId } from '@midstem/chronous'

const DAY_OPTIONS: FormatOptions = {
  weekday: 'short',
  day: 'numeric',
  month: 'short'
}

const TIME_OPTIONS: FormatOptions = {
  hour: '2-digit',
  minute: '2-digit'
}

const NUMBER_OPTIONS: FormatOptions = { day: 'numeric' }

const TITLE_OPTIONS: FormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
}

const labelWith =
  (options: FormatOptions): ((at: IsoDateTime, locale: LocaleId) => string) =>
  (at, locale) => {
    try {
      return formatIso(at, { locale, options })
    } catch {
      return at
    }
  }

export const dayLabel = labelWith(DAY_OPTIONS)

export const timeLabel = labelWith(TIME_OPTIONS)

export const numberLabel = labelWith(NUMBER_OPTIONS)

export const titleLabel = labelWith(TITLE_OPTIONS)
