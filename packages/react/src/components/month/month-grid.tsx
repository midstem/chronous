import { useCalendarContext } from '../context/calendar-context'
import { weekdayLabel } from '../helpers'
import type { CalendarDay } from '@midstem/chronous'
import type { ReactNode } from 'react'

type MonthGridProps<TData = any> = {
  children: ReactNode
  className?: string
  weekdayHeader?: (ctx: { days: CalendarDay<TData>[] }) => ReactNode
}

export const MonthGrid = <TData = any,>({
  children,
  className,
  weekdayHeader
}: MonthGridProps<TData>): ReactNode => {
  const { calendar, locale } = useCalendarContext<TData>()

  const firstDays = calendar.days.slice(0, 7)

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%'
      }}
    >
      {weekdayHeader ? (
        weekdayHeader({ days: firstDays })
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))'
          }}
        >
          {firstDays.map((day) => (
            <div key={day.date} style={{ textAlign: 'center' }}>
              {weekdayLabel(day.date, locale)}
            </div>
          ))}
        </div>
      )}
      {children}
    </div>
  )
}
