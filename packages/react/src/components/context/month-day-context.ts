import type { CalendarBox, CalendarDay } from '@midstem/chronous'
import { createContext, useContext } from 'react'

export type MonthDayContextValue<TData = unknown> = {
  day: CalendarDay<TData>
  boxes: CalendarBox<TData>[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MonthDayContext = createContext<MonthDayContextValue<any> | null>(null)

MonthDayContext.displayName = 'MonthDayContext'

export const MonthDayProvider = MonthDayContext.Provider

export const useMonthDayContext = <
  TData = unknown
>(): MonthDayContextValue<TData> => {
  const ctx = useContext(MonthDayContext)

  if (!ctx) {
    throw new Error(
      'MonthDay components must be used within <Calendar.MonthDays>'
    )
  }

  return ctx as MonthDayContextValue<TData>
}
