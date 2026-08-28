import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { useCalendarContext } from '../context/calendar-context'
import { TimeGridProvider } from '../context/time-grid-context'
import { templateOf } from '../helpers'

export type TimeGridProps = {
  children: ReactNode
  hourHeight?: number
  gutterWidth?: string
  scrollTo?: number
  className?: string
}

export const TimeGrid = ({
  children,
  hourHeight = 60,
  gutterWidth = '3.25rem',
  scrollTo = 7,
  className
}: TimeGridProps): ReactNode => {
  const { calendar } = useCalendarContext()
  const dayHeight = hourHeight * 24
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = hourHeight * scrollTo
    }
  }, [hourHeight, scrollTo])

  return (
    <TimeGridProvider value={{ hourHeight, dayHeight, gutterWidth }}>
      <div ref={scrollRef} style={{ overflowY: 'auto' }} className={className}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: templateOf(gutterWidth, calendar.days.length)
          }}
        >
          {children}
        </div>
      </div>
    </TimeGridProvider>
  )
}
