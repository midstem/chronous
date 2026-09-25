import { calendarReducer, initialCalendarState } from '@midstem/chronous'
import type { CalendarAction, CalendarRange, ViewKind } from '@midstem/chronous'

import type { CalendarNavigation } from './types'

const applied = (range: CalendarRange, action: CalendarAction): CalendarRange =>
  calendarReducer(initialCalendarState(range), action).range

const attempted = (
  range: CalendarRange,
  action: CalendarAction
): CalendarRange | null => {
  try {
    return applied(range, action)
  } catch {
    return null
  }
}

const todayAction = (): CalendarAction => ({
  type: 'today',
  now: new Date().toISOString()
})

const viewer =
  (range: CalendarRange) =>
  (view: ViewKind): CalendarRange =>
    applied(range, { type: 'view', view })

export const navigationOf = (range: CalendarRange): CalendarNavigation => {
  return {
    next: attempted(range, { type: 'next' }),
    prev: attempted(range, { type: 'prev' }),
    today: attempted(range, todayAction())
      ? () => applied(range, todayAction())
      : null,
    withView: viewer(range)
  }
}
