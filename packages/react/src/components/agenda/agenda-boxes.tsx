import { useCalendarContext } from '../context/calendar-context'
import { useAgendaDayContext } from '../context/agenda-day-context'
import { formatRange } from '../helpers'
import type { TimedEntry, CalendarBox } from '@midstem/chronous'
import type { ReactNode } from 'react'

export type AgendaBoxesProps<TData = any> = {
  children?: (ctx: {
    event: TimedEntry<TData>
    box: CalendarBox<TData>
    timeRange: string
  }) => ReactNode
  className?: string
}

export const AgendaBoxes = <TData = any,>({
  children,
  className
}: AgendaBoxesProps<TData>): ReactNode => {
  const { locale } = useCalendarContext()
  const { boxes } = useAgendaDayContext()

  return (
    <>
      {boxes.map((box) => {
        const typedBox = box as CalendarBox<TData>
        const timeRange = formatRange(typedBox.start, typedBox.end, locale)
        return (
          <div
            key={`${typedBox.event.id}-${typedBox.startMinute}`}
            className={className}
          >
            {children ? (
              children({ event: typedBox.event, box: typedBox, timeRange })
            ) : (
              <div>
                {typedBox.event.id} {timeRange}
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}
