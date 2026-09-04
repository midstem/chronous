import { InjectionToken, inject } from '@angular/core'

import type { AllDayContext, CalendarContext, TimeGridContext } from './types'

export const CALENDAR_CONTEXT = new InjectionToken<CalendarContext>(
  'CalendarContext'
)

export const TIME_GRID_CONTEXT = new InjectionToken<TimeGridContext>(
  'TimeGridContext'
)

export const ALL_DAY_CONTEXT = new InjectionToken<AllDayContext>(
  'AllDayContext'
)

const readContext = <TValue>(
  token: InjectionToken<TValue>,
  name: string,
  parent: string
): TValue => {
  const context = inject(token, { optional: true })

  if (!context) throw new Error(`${name} is only readable inside ${parent}`)

  return context
}

export const injectCalendarContext = <
  TData = unknown
>(): CalendarContext<TData> =>
  readContext(
    CALENDAR_CONTEXT,
    'CalendarContext',
    '*chronousCalendar'
  ) as CalendarContext<TData>

export const injectTimeGridContext = (): TimeGridContext =>
  readContext(TIME_GRID_CONTEXT, 'TimeGridContext', '<chronous-time-grid>')

export const injectAllDayContext = <TData = unknown>(): AllDayContext<TData> =>
  readContext(
    ALL_DAY_CONTEXT,
    'AllDayContext',
    '<chronous-all-day-row>'
  ) as AllDayContext<TData>

export type * from './types'
