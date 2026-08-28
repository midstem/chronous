import type { Calendar, LocaleId, RangeSpec } from '@midstem/chronous'
import { createContext, useContext } from 'react'

export type CalendarContextValue<TData = unknown> = {
  calendar: Calendar<TData>
  spec: RangeSpec
  locale: LocaleId
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CalendarContext = createContext<CalendarContextValue<any> | null>(null)

CalendarContext.displayName = 'CalendarContext'

export const CalendarProvider = CalendarContext.Provider

export const useCalendarContext = <
  TData = unknown
>(): CalendarContextValue<TData> => {
  const ctx = useContext(CalendarContext)

  if (!ctx) {
    throw new Error(
      'Calendar compound components must be used within <Calendar.Root>'
    )
  }

  return ctx as CalendarContextValue<TData>
}
