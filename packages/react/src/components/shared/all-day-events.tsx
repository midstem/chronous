import type { ReactNode } from 'react'
import type { CalendarEntry, CalendarBar } from '@midstem/chronous'
import { useAllDayContext } from '../context/all-day-context'

export type AllDayEventsProps<TData> = {
  children?: (ctx: {
    event: CalendarEntry<TData>
    bar: CalendarBar<TData>
  }) => ReactNode
  className?: string
  gap?: number
}

export const AllDayEvents = <TData,>({
  children,
  className,
  gap = 4
}: AllDayEventsProps<TData>): ReactNode => {
  const { row, laneHeight } = useAllDayContext<TData>()

  return (
    <>
      {row.bars.map((bar) => {
        const key = `${bar.event.id}-${bar.startDay}`
        return (
          <div
            key={key}
            className={className}
            style={{
              position: 'absolute',
              left: `calc(${bar.left * 100}% + 2px)`,
              width: `calc(${bar.width * 100}% - ${gap}px)`,
              top: bar.lane * laneHeight
            }}
          >
            {children
              ? children({ event: bar.event, bar })
              : ((bar.event.data as string) ?? bar.event.id)}
          </div>
        )
      })}
    </>
  )
}
