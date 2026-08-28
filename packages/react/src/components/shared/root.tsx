import type { ReactNode } from 'react'
import type { EventInput, RangeSpec } from '@midstem/chronous'

import { useCalendar } from '#src/calendar'
import type { CalendarError } from '#src/calendar'
import { CalendarProvider } from '../context/calendar-context'

export type RootProps<TData> = {
  spec: RangeSpec
  events: readonly EventInput<TData>[]
  locale?: string
  children: ReactNode
  className?: string
  fallback?: (error: CalendarError) => ReactNode
}

export const Root = <TData,>({
  spec,
  events,
  locale = 'en-US',
  children,
  className,
  fallback
}: RootProps<TData>): ReactNode => {
  const { calendar, error } = useCalendar(spec, events)

  if (error) {
    if (fallback) {
      return fallback(error)
    }
    return <p>{error.message}</p>
  }

  if (!calendar) {
    return null
  }

  return (
    <CalendarProvider value={{ calendar, spec, locale }}>
      <div role="application" className={className}>
        {children}
      </div>
    </CalendarProvider>
  )
}
