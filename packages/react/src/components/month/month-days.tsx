import { useCalendarContext } from '../context/calendar-context'
import { useMonthRowContext } from '../context/month-row-context'
import { MonthDayProvider } from '../context/month-day-context'
import { numberLabel } from '../helpers'
import type { CalendarDay, CalendarBox } from '@midstem/chronous'
import type { ReactNode } from 'react'

type MonthDaysProps<TData = any> = {
  children?: (ctx: {
    day: CalendarDay<TData>
    dayNumber: string
    inPeriod: boolean
    boxes: CalendarBox<TData>[]
  }) => ReactNode
  className?: string
}

export const MonthDays = <TData = any,>({
  children,
  className
}: MonthDaysProps<TData>): ReactNode => {
  const { locale } = useCalendarContext<TData>()
  const { days } = useMonthRowContext<TData>()

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
        height: '100%'
      }}
    >
      {days.map((day) => {
        const dayNumber = numberLabel(day.date, locale)
        const inPeriod = day.inPeriod
        const boxes = day.boxes

        return (
          <MonthDayProvider key={day.date} value={{ day, boxes }}>
            <div className={className}>
              {children ? (
                children({ day, dayNumber, inPeriod, boxes })
              ) : (
                <span>{dayNumber}</span>
              )}
            </div>
          </MonthDayProvider>
        )
      })}
    </div>
  )
}
