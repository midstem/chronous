import { calendarReducer, initialCalendarState } from '@midstem/chronous'
import type { CalendarAction, CalendarRange, ViewKind } from '@midstem/chronous'

export type CalendarNavigation = {
  prev: CalendarRange | null
  next: CalendarRange | null
  today: (() => CalendarRange) | null
  withView: (view: ViewKind) => CalendarRange
}

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

export const createNavigation = (range: CalendarRange): CalendarNavigation => ({
  next: attempted(range, { type: 'next' }),
  prev: attempted(range, { type: 'prev' }),
  today: attempted(range, todayAction())
    ? () => applied(range, todayAction())
    : null,
  withView: viewer(range)
})
