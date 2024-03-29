import WeekView from '../WeekView'
import MonthView from '../MonthView'
import DayView from '../DayView'
import { ConfigT } from '../../types'

export const VIEW_MODES = {
  week: WeekView,
  day: DayView,
  month: MonthView,
}

export const END_HOUR = 24

export const START_HOUR = 0

export const initialConfig: ConfigT[] = [{ maxWidth: 450, mode: 'mobile' }]
