import type { ReactNode } from 'react'
import { useCalendarContext } from '../context/calendar-context'
import { useTimeGridContext } from '../context/time-grid-context'
import { DayColumnProvider } from '../context/day-column-context'

export type DayColumnsProps = {
  children: ReactNode
  className?: string
}

export const DayColumns = ({
  children,
  className
}: DayColumnsProps): ReactNode => {
  const { calendar } = useCalendarContext()
  const { dayHeight } = useTimeGridContext()

  return (
    <>
      {calendar.days.map((day) => (
        <DayColumnProvider key={day.date} value={{ day }}>
          <div
            style={{ position: 'relative', height: dayHeight }}
            className={className}
          >
            {children}
          </div>
        </DayColumnProvider>
      ))}
    </>
  )
}
