import type { RangeSpec } from '#src/range'
import type { IsoDate } from '#src/time'

import { BACKWARD, FORWARD } from './constants'
import { dateAt, shiftedDate } from './helpers'
import type { CalendarAction, CalendarState } from './types'

const withDate = (state: CalendarState, date: IsoDate): CalendarState =>
  date === state.spec.date ? state : { ...state, spec: { ...state.spec, date } }

export const initialCalendarState = (spec: RangeSpec): CalendarState => ({
  spec,
  selection: null
})

export const calendarReducer = (
  state: CalendarState,
  action: CalendarAction
): CalendarState => {
  switch (action.type) {
    case 'next':
      return withDate(state, shiftedDate(state.spec, FORWARD))
    case 'prev':
      return withDate(state, shiftedDate(state.spec, BACKWARD))
    case 'today':
      return withDate(state, dateAt(action.now, state.spec.timeZone))
    case 'goto':
      return withDate(state, action.date)
    case 'view':
      return action.view === state.spec.view
        ? state
        : { ...state, spec: { ...state.spec, view: action.view } }
    case 'select':
      return { ...state, selection: action.selection }
    default:
      return state.selection ? { ...state, selection: null } : state
  }
}

export type * from './types'
