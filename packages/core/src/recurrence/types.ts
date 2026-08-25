import type { IsoDateTime, WeekStartsOn } from '#src/time'

export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'

export type WeekDay = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU'

export type ByDay = {
  weekday: WeekDay
  ordinal?: number
}

export type RecurrenceRule = {
  frequency: Frequency
  interval: number
  count?: number
  until?: IsoDateTime
  byDay: ByDay[]
  byMonthDay: number[]
  byMonth: number[]
  bySetPos: number[]
  weekStartsOn: WeekStartsOn
}
