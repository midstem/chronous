import type { ViewKind } from '#src/range'
import { DAYS_IN_WEEK, MINUTES_IN_DAY } from '#src/time'

export const MIN_LANE_MINUTES = MINUTES_IN_DAY

export const WEEK_ROW_VIEWS: readonly ViewKind[] = ['month']

export const WEEK_ROW_DAYS = DAYS_IN_WEEK

export const NOT_FOUND = -1
