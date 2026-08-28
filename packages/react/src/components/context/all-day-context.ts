import type { CalendarRow } from '@midstem/chronous'
import { createContext, useContext } from 'react'

export type AllDayContextValue<TData = unknown> = {
  row: CalendarRow<TData>
  laneHeight: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AllDayContext = createContext<AllDayContextValue<any> | null>(null)

AllDayContext.displayName = 'AllDayContext'

export const AllDayProvider = AllDayContext.Provider

export const useAllDayContext = <
  TData = unknown
>(): AllDayContextValue<TData> => {
  const ctx = useContext(AllDayContext)

  if (!ctx) {
    throw new Error(
      'AllDay components must be used within <Calendar.AllDayRow>'
    )
  }

  return ctx as AllDayContextValue<TData>
}
