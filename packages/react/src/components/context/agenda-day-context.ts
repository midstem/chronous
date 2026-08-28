import type { CalendarBar, CalendarBox, CalendarDay } from '@midstem/chronous'
import { createContext, useContext } from 'react'

export type AgendaDayContextValue<TData = unknown> = {
  day: CalendarDay<TData>
  bars: CalendarBar<TData>[]
  boxes: CalendarBox<TData>[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AgendaDayContext = createContext<AgendaDayContextValue<any> | null>(null)

AgendaDayContext.displayName = 'AgendaDayContext'

export const AgendaDayProvider = AgendaDayContext.Provider

export const useAgendaDayContext = <
  TData = unknown
>(): AgendaDayContextValue<TData> => {
  const ctx = useContext(AgendaDayContext)

  if (!ctx) {
    throw new Error(
      'AgendaDay components must be used within <Calendar.AgendaDays>'
    )
  }

  return ctx as AgendaDayContextValue<TData>
}
