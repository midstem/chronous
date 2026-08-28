import type { ReactNode } from 'react'
import type { CalendarSlot } from '@midstem/chronous'
import { useDayColumnContext } from '../context/day-column-context'
import { fractionOf } from '../helpers'

export type TimeSlotsProps = {
  children?: (ctx: { slot: CalendarSlot; minuteOfDay: number }) => ReactNode
  className?: string
}

export const TimeSlots = ({
  children,
  className
}: TimeSlotsProps): ReactNode => {
  const { day } = useDayColumnContext()

  return (
    <>
      {day.slots.map((slot) => {
        const top = `${fractionOf(slot.minuteOfDay) * 100}%`
        const ctx = { slot, minuteOfDay: slot.minuteOfDay }

        return (
          <span
            key={slot.minuteOfDay}
            style={{ position: 'absolute', top, left: 0, right: 0 }}
            className={className}
          >
            {typeof children === 'function' ? children(ctx) : null}
          </span>
        )
      })}
    </>
  )
}
