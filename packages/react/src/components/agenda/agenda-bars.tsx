import { useAgendaDayContext } from '../context/agenda-day-context'
import type { CalendarEntry, CalendarBar } from '@midstem/chronous'
import type { ReactNode } from 'react'

export type AgendaBarsProps<TData = any> = {
  children?: (ctx: {
    event: CalendarEntry<TData>
    bar: CalendarBar<TData>
  }) => ReactNode
  className?: string
}

export const AgendaBars = <TData = any,>({
  children,
  className
}: AgendaBarsProps<TData>): ReactNode => {
  const { bars } = useAgendaDayContext()

  return (
    <>
      {bars.map((bar) => {
        const typedBar = bar as CalendarBar<TData>
        return (
          <div
            key={`${typedBar.event.id}-${typedBar.startDay}`}
            className={className}
          >
            {children ? (
              children({ event: typedBar.event, bar: typedBar })
            ) : (
              <div>{typedBar.event.id} (all-day)</div>
            )}
          </div>
        )
      })}
    </>
  )
}
