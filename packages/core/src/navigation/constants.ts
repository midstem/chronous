import type { ViewKind } from '#src/range'
import { DAYS_IN_WEEK } from '#src/time'

export const FORWARD = 1

export const BACKWARD = -1

export const SINGLE_DAY = 1

export const MONTH_VIEW: ViewKind = 'month'

export const STEP_DAYS_BY_VIEW: Partial<Record<ViewKind, number>> = {
  day: SINGLE_DAY,
  week: DAYS_IN_WEEK
}

export const UNREADABLE_MOMENT_REASON = 'the current moment cannot be read'
