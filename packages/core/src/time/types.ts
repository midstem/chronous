export type IsoDate = string

export type IsoDateTime = string

export type TimeZoneId = string

export type LocaleId = string

export type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type Disambiguation = 'compatible' | 'earlier' | 'later' | 'reject'

export type CompareResult = -1 | 0 | 1

export type Moment = Temporal.ZonedDateTime

export type CalendarDate = Temporal.PlainDate

export type TimeSpan = Temporal.Duration

export type TimeSpanLike = {
  years?: number
  months?: number
  weeks?: number
  days?: number
  hours?: number
  minutes?: number
  seconds?: number
  milliseconds?: number
}

export type TimePoint = Moment | CalendarDate

export type DateFields = {
  year: number
  month: number
  day: number
}

export type FormatOptions = Intl.DateTimeFormatOptions

export type FormatSpec = {
  locale: LocaleId
  timeZone?: TimeZoneId
  options?: FormatOptions
}
