import { calendarReducer, initialCalendarState } from '@midstem/chronous'
import type { CalendarAction, RangeSpec, ViewKind } from '@midstem/chronous'

import type { CalendarNavigation } from './types'

const applied = (spec: RangeSpec, action: CalendarAction): RangeSpec =>
  calendarReducer(initialCalendarState(spec), action).spec

const attempted = (
  spec: RangeSpec,
  action: CalendarAction
): RangeSpec | null => {
  try {
    return applied(spec, action)
  } catch {
    return null
  }
}

const todayAction = (): CalendarAction => ({
  type: 'today',
  now: new Date().toISOString()
})

export const navigationOf = (spec: RangeSpec): CalendarNavigation => ({
  next: attempted(spec, { type: 'next' }),
  prev: attempted(spec, { type: 'prev' }),
  today: attempted(spec, todayAction())
    ? () => applied(spec, todayAction())
    : null,
  withView: (view: ViewKind) => applied(spec, { type: 'view', view })
})
