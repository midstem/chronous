import type { ReactNode } from 'react'
import type { CalendarSlot } from '@midstem/chronous'
import { useCalendarContext } from '../context/calendar-context'
import { useTimeGridContext } from '../context/time-grid-context'
import { fractionOf, timeLabel, wallTimeOn } from '../helpers'

export type TimeLabelsProps = {
  children?: (ctx: {
    time: string
    slot: CalendarSlot
    minuteOfDay: number
  }) => ReactNode
  className?: string
}

export const TimeLabels = ({
  children,
  className
}: TimeLabelsProps): ReactNode => {
  const { calendar, locale } = useCalendarContext()
  const { dayHeight } = useTimeGridContext()

  if (calendar.days.length === 0) return null

  const day = calendar.days[0]

  return (
    <div
      style={{ position: 'relative', height: dayHeight }}
      className={className}
    >
      {day.slots.map((slot) => {
        if (slot.minuteOfDay === 0) return null

        const time = timeLabel(wallTimeOn(day.date, slot.minuteOfDay), locale)
        const ctx = { time, slot, minuteOfDay: slot.minuteOfDay }

        return (
          <div
            key={slot.minuteOfDay}
            style={{
              position: 'absolute',
              top: `${fractionOf(slot.minuteOfDay) * 100}%`,
              transform: 'translateY(-50%)'
            }}
          >
            {typeof children === 'function' ? (
              children(ctx)
            ) : (
              <span>{time}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
