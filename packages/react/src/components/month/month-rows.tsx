import { useCalendarContext } from '../context/calendar-context'
import { MonthRowProvider } from '../context/month-row-context'
import { rowsWithDays } from '../helpers'
import type { ReactNode } from 'react'

type MonthRowsProps = {
  children: ReactNode
  className?: string
}

export const MonthRows = <TData = any,>({
  children,
  className
}: MonthRowsProps): ReactNode => {
  const { calendar } = useCalendarContext<TData>()
  const groups = rowsWithDays(calendar)

  return (
    <>
      {groups.map(({ row, days }) => (
        <MonthRowProvider key={row.start} value={{ row, days }}>
          <div
            className={className}
            style={{
              position: 'relative',
              flex: 1
            }}
          >
            {children}
          </div>
        </MonthRowProvider>
      ))}
    </>
  )
}
