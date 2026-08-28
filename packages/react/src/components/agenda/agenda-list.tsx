import { useCalendarContext } from '../context/calendar-context'
import { AgendaDayProvider } from '../context/agenda-day-context'
import type { Calendar, CalendarBar } from '@midstem/chronous'
import type { ReactNode } from 'react'

const barsOnDay = <TData,>(
  calendar: Calendar<TData>,
  dayIndex: number
): CalendarBar<TData>[] => {
  let taken = 0
  for (const row of calendar.rows) {
    if (dayIndex < taken + row.days) {
      const offset = dayIndex - taken
      return row.bars.filter(
        (bar) => bar.startDay <= offset && offset < bar.endDay
      )
    }
    taken += row.days
  }
  return []
}

export type AgendaListProps = {
  children: ReactNode
  className?: string
  showEmpty?: boolean
}

export const AgendaList = ({
  children,
  className,
  showEmpty = false
}: AgendaListProps): ReactNode => {
  const { calendar } = useCalendarContext()

  return (
    <div className={className}>
      {calendar.days.map((day, index) => {
        const bars = barsOnDay(calendar, index)
        const boxes = day.boxes
        if (!showEmpty && bars.length === 0 && boxes.length === 0) return null

        return (
          <AgendaDayProvider key={day.date} value={{ day, bars, boxes }}>
            {children}
          </AgendaDayProvider>
        )
      })}
    </div>
  )
}
