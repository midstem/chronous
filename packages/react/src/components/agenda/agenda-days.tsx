import { useCalendarContext } from '../context/calendar-context'
import { useAgendaDayContext } from '../context/agenda-day-context'
import { numberLabel, weekdayLabel } from '../helpers'
import type { CalendarDay } from '@midstem/chronous'
import type { ReactNode } from 'react'

export type AgendaDaysProps<TData = any> = {
  children?: ReactNode
  heading?: (ctx: {
    day: CalendarDay<TData>
    dateFormatted: string
    monthFormatted: string
    weekdayFormatted: string
  }) => ReactNode
  className?: string
}

export const AgendaDays = <TData = any,>({
  children,
  heading,
  className
}: AgendaDaysProps<TData>): ReactNode => {
  const { locale } = useCalendarContext()
  const { day } = useAgendaDayContext()

  const dateFormatted = numberLabel(day.date, locale)
  const monthFormatted = new Intl.DateTimeFormat(locale, {
    month: 'short'
  }).format(new Date(day.date))
  const weekdayFormatted = weekdayLabel(day.date, locale)

  return (
    <div className={className}>
      {heading ? (
        heading({
          day: day as CalendarDay<TData>,
          dateFormatted,
          monthFormatted,
          weekdayFormatted
        })
      ) : (
        <div>
          <div>{dateFormatted}</div>
          <div>{weekdayFormatted}</div>
        </div>
      )}
      {children}
    </div>
  )
}
