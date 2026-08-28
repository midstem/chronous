import { useMonthDayContext } from '../context/month-day-context'
import type { TimedEntry, CalendarBox } from '@midstem/chronous'
import { Fragment } from 'react'
import type { ReactNode } from 'react'

type MonthDotsProps<TData = any> = {
  children?: (ctx: {
    event: TimedEntry<TData>
    box: CalendarBox<TData>
  }) => ReactNode
  className?: string
  size?: number
}

export const MonthDots = <TData = any,>({
  children,
  className,
  size = 6
}: MonthDotsProps<TData>): ReactNode => {
  const { boxes } = useMonthDayContext<TData>()

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2px'
      }}
    >
      {boxes.map((box) => {
        const event = box.event
        const key = `${event.id}-${box.startMinute}`

        return children ? (
          <Fragment key={key}>{children({ event, box })}</Fragment>
        ) : (
          <span
            key={key}
            style={{
              display: 'inline-block',
              width: size,
              height: size,
              borderRadius: '50%',
              backgroundColor: 'currentColor'
            }}
          />
        )
      })}
    </div>
  )
}
