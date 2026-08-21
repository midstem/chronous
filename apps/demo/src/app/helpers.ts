import type { Calendar, IsoDateTime } from '@midstem/chronous'

export const periodStart = <TData>(calendar: Calendar<TData>): IsoDateTime =>
  (calendar.days.find((day) => day.inPeriod) ?? calendar.days[0]).start

export const isSlotted = <TData>(calendar: Calendar<TData>): boolean =>
  calendar.days.some((day) => day.slots.length > 0)
