import type { ReactNode } from 'react'
import type { CalendarBox, TimedEntry } from '@midstem/chronous'
import { useDayColumnContext } from '../context/day-column-context'

export type TimedEventsProps<TData = any> = {
  children?: (ctx: {
    event: TimedEntry<TData>
    box: CalendarBox<TData>
  }) => ReactNode
  className?: string
  minHeight?: number
  gap?: number
}

export const TimedEvents = <TData,>({
  children,
  className,
  minHeight = 22,
  gap = 3
}: TimedEventsProps<TData>): ReactNode => {
  const { day } = useDayColumnContext<TData>()

  return (
    <>
      {day.boxes.map((box) => {
        const key = `${box.event.id}-${box.startMinute}`

        return (
          <div
            key={key}
            className={className}
            style={{
              position: 'absolute',
              overflow: 'hidden',
              top: `${box.top * 100}%`,
              height: `${box.height * 100}%`,
              left: `${box.left * 100}%`,
              width: `calc(${box.width * 100}% - ${gap}px)`,
              minHeight: `${minHeight}px`
            }}
          >
            {typeof children === 'function'
              ? children({ event: box.event, box })
              : String(box.event.data ?? box.event.id)}
          </div>
        )
      })}
    </>
  )
}
