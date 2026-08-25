import { DAYS_IN_WEEK, MINUTES_IN_DAY } from '#src/time'
import type { WeekStartsOn } from '#src/time'

import type { ViewKind } from './types'

export const SINGLE_DAY = { days: 1 }

export const ONE_MONTH = { months: 1 }

export const DEFAULT_SLOT_MINUTES = 60

export const DEFAULT_WEEK_STARTS_ON: WeekStartsOn = 1

export const DEFAULT_SPAN_DAYS = DAYS_IN_WEEK

export const DEFAULT_AGENDA_DAYS = 30

export const MIN_SLOT_MINUTES = 1

export const MAX_SLOT_MINUTES = MINUTES_IN_DAY

export const MIN_DAY_COUNT = 1

export const SLOTTED_VIEWS: readonly ViewKind[] = ['day', 'week', 'days']

export const TIME_ZONE_PROBE = '1970-01-01T00:00:00'

export const UNREADABLE_DATE_REASON = 'the anchor date cannot be read'

export const UNREADABLE_TIME_ZONE_REASON = 'the time zone cannot be read'

export const INVALID_SLOT_MINUTES_REASON = `slotMinutes must be a whole number between ${MIN_SLOT_MINUTES} and ${MAX_SLOT_MINUTES}`

export const INVALID_DAY_COUNT_REASON = `dayCount must be a whole number of at least ${MIN_DAY_COUNT}`
