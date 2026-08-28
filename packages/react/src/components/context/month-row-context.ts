import type { CalendarDay, CalendarRow } from '@midstem/chronous'
import { createContext, useContext } from 'react'

export type MonthRowContextValue<TData = unknown> = {
  row: CalendarRow<TData>
  days: CalendarDay<TData>[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MonthRowContext = createContext<MonthRowContextValue<any> | null>(null)

MonthRowContext.displayName = 'MonthRowContext'

export const MonthRowProvider = MonthRowContext.Provider

export const useMonthRowContext = <
  TData = unknown
>(): MonthRowContextValue<TData> => {
  const ctx = useContext(MonthRowContext)

  if (!ctx) {
    throw new Error(
      'MonthRow components must be used within <Calendar.MonthRows>'
    )
  }

  return ctx as MonthRowContextValue<TData>
}
