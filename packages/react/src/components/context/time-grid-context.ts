import { createContext, useContext } from 'react'

export type TimeGridContextValue = {
  hourHeight: number
  dayHeight: number
  gutterWidth: string
}

const TimeGridContext = createContext<TimeGridContextValue | null>(null)

TimeGridContext.displayName = 'TimeGridContext'

export const TimeGridProvider = TimeGridContext.Provider

export const useTimeGridContext = (): TimeGridContextValue => {
  const ctx = useContext(TimeGridContext)

  if (!ctx) {
    throw new Error(
      'TimeGrid components must be used within <Calendar.TimeGrid>'
    )
  }

  return ctx
}
