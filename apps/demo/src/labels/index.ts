import type { IsoDateTime, LocaleId, TimeZoneId } from '@midstem/chronous'

const DAY_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  day: 'numeric',
  month: 'short'
}

const TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit'
}

const NUMBER_OPTIONS: Intl.DateTimeFormatOptions = { day: 'numeric' }

const TITLE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
}

const KEY_SEPARATOR = '|'

const cache = new Map<string, Intl.DateTimeFormat>()

const formatterOf = (
  key: string,
  locale: LocaleId,
  timeZone: TimeZoneId,
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat => {
  const cacheKey = [key, locale, timeZone].join(KEY_SEPARATOR)
  const held = cache.get(cacheKey)

  if (held) return held

  const made = new Intl.DateTimeFormat(locale, { ...options, timeZone })

  cache.set(cacheKey, made)

  return made
}

const labelWith =
  (
    key: string,
    options: Intl.DateTimeFormatOptions
  ): ((at: IsoDateTime, locale: LocaleId, timeZone: TimeZoneId) => string) =>
  (at, locale, timeZone) =>
    formatterOf(key, locale, timeZone, options).format(new Date(at))

export const dayLabel = labelWith('day', DAY_OPTIONS)

export const timeLabel = labelWith('time', TIME_OPTIONS)

export const numberLabel = labelWith('number', NUMBER_OPTIONS)

export const titleLabel = labelWith('title', TITLE_OPTIONS)
