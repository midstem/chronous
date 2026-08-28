import type { ReactNode } from 'react'
import type { CalendarDay } from '@midstem/chronous'
import { useCalendarContext } from '../context/calendar-context'
import { weekdayLabel, numberLabel } from '../helpers'

export type DayHeadingsProps<TData> = {
  children?: (ctx: {
    day: CalendarDay<TData>
    weekday: string
    dayNumber: string
    date: string
    inPeriod: boolean
  }) => ReactNode
  className?: string
}

export const DayHeadings = <TData,>({
  children,
  className
}: DayHeadingsProps<TData>): ReactNode => {
  const { calendar, locale } = useCalendarContext<TData>()

  return (
    <>
      {calendar.days.map((day) => {
        const weekday = weekdayLabel(day.date, locale)
        const dayNumber = numberLabel(day.date, locale)

        return (
          <div key={day.date} className={className}>
            {children ? (
              children({
                day,
                weekday,
                dayNumber,
                date: day.date,
                inPeriod: day.inPeriod
              })
            ) : (
              <>
                <span>{weekday}</span> <span>{dayNumber}</span>
              </>
            )}
          </div>
        )
      })}
    </>
  )
}
