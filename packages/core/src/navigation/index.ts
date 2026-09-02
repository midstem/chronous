import type { CalendarRange } from '#src/range'
import type { IsoDate } from '#src/time'

import { BACKWARD, FORWARD } from './constants'
import { dateAt, shiftedDate } from './helpers'
import type { CalendarAction, CalendarState } from './types'

const withDate = (state: CalendarState, date: IsoDate): CalendarState =>
  date === state.range.currentDate
    ? state
    : { ...state, range: { ...state.range, currentDate: date } }

export const initialCalendarState = (range: CalendarRange): CalendarState => ({
  range,
  selection: null
})

export const calendarReducer = (
  state: CalendarState,
  action: CalendarAction
): CalendarState => {
  switch (action.type) {
    case 'next':
      return withDate(state, shiftedDate(state.range, FORWARD))
    case 'prev':
      return withDate(state, shiftedDate(state.range, BACKWARD))
    case 'today':
      return withDate(state, dateAt(action.now, state.range.timeZone))
    case 'goto':
      return withDate(state, action.date)
    case 'view':
      return action.view === state.range.view
        ? state
        : { ...state, range: { ...state.range, view: action.view } }
    case 'select':
      return { ...state, selection: action.selection }
    default:
      return state.selection ? { ...state, selection: null } : state
  }
}

export type * from './types'
