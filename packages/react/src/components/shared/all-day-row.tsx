import type { ReactNode } from 'react'
import { useCalendarContext } from '../context/calendar-context'
import { AllDayProvider } from '../context/all-day-context'
import { templateOf } from '../helpers'

export type AllDayRowProps = {
  children: ReactNode
  laneHeight?: number
  className?: string
  label?: ReactNode
  gutterWidth?: string
}

export const AllDayRow = ({
  children,
  laneHeight = 24,
  className,
  label = 'all-day',
  gutterWidth = '3.25rem'
}: AllDayRowProps): ReactNode => {
  const { calendar } = useCalendarContext()
  const row = calendar.rows[0]

  if (!row || row.lanes === 0) {
    return null
  }

  return (
    <AllDayProvider value={{ row, laneHeight }}>
      <div
        className={className}
        style={{
          display: 'grid',
          gridTemplateColumns: templateOf(gutterWidth, calendar.days.length)
        }}
      >
        <div>{label}</div>
        <div
          style={{
            gridColumn: '2 / -1',
            position: 'relative',
            height: Math.max(row.lanes, 1) * laneHeight
          }}
        >
          {children}
        </div>
      </div>
    </AllDayProvider>
  )
}
