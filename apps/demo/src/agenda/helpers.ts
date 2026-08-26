import type { Calendar, CalendarBar, CalendarBox } from '@midstem/chronous'

import { barsOnDay } from '../rows'
import type { EventData } from '../types'

export type AgendaDay = {
  date: string
  inPeriod: boolean
  bars: CalendarBar<EventData>[]
  boxes: CalendarBox<EventData>[]
}

export const agendaDays = (
  calendar: Calendar<EventData>
): readonly AgendaDay[] =>
  calendar.days.map((day, index) => ({
    date: day.date,
    inPeriod: day.inPeriod,
    bars: barsOnDay(calendar, index),
    boxes: day.boxes
  }))
