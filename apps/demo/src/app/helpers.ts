import type { Calendar, IsoDate } from '@midstem/chronous'

export const periodDate = <TData>(calendar: Calendar<TData>): IsoDate =>
  (calendar.days.find((day) => day.inPeriod) ?? calendar.days[0]).date

export const isSlotted = <TData>(calendar: Calendar<TData>): boolean =>
  calendar.days.some((day) => day.slots.length > 0)
