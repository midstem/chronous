import { useMonthRowContext } from '../context/month-row-context'
import { PERCENT } from '../helpers'
import type { CalendarEntry, CalendarBar } from '@midstem/chronous'
import type { ReactNode } from 'react'

type MonthBarsProps<TData = any> = {
  children?: (ctx: {
    event: CalendarEntry<TData>
    bar: CalendarBar<TData>
  }) => ReactNode
  className?: string
  laneHeight?: number
  gap?: number
  numberHeight?: number
}

export const MonthBars = <TData = any,>({
  children,
  className,
  laneHeight = 20,
  gap = 4,
  numberHeight = 28
}: MonthBarsProps<TData>): ReactNode => {
  const { row } = useMonthRowContext<TData>()

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: numberHeight,
        height: row.lanes * laneHeight,
        pointerEvents: 'none'
      }}
    >
      {row.bars.map((bar) => {
        const event = bar.event
        const key = `${event.id}-${bar.startDay}`

        return (
          <div
            key={key}
            style={{
              position: 'absolute',
              left: `calc(${bar.left * PERCENT}% + ${gap / 2}px)`,
              width: `calc(${bar.width * PERCENT}% - ${gap}px)`,
              top: bar.lane * laneHeight
            }}
          >
            {children ? children({ event, bar }) : <div>{event.id}</div>}
          </div>
        )
      })}
    </div>
  )
}
