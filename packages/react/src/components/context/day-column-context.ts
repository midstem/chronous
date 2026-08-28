import type { CalendarDay } from '@midstem/chronous'
import { createContext, useContext } from 'react'

export type DayColumnContextValue<TData = unknown> = {
  day: CalendarDay<TData>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DayColumnContext = createContext<DayColumnContextValue<any> | null>(null)

DayColumnContext.displayName = 'DayColumnContext'

export const DayColumnProvider = DayColumnContext.Provider

export const useDayColumnContext = <
  TData = unknown
>(): DayColumnContextValue<TData> => {
  const ctx = useContext(DayColumnContext)

  if (!ctx) {
    throw new Error(
      'DayColumn components must be used within <Calendar.DayColumns>'
    )
  }

  return ctx as DayColumnContextValue<TData>
}
