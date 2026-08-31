import type { CalendarSlot } from '@midstem/chronous'
import type { ElementType, ReactNode } from 'react'

import { useDayColumnContext } from '../context'
import { minutePercentOf, renderSlot, styleOf, tagOf } from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

export type TimeSlotScope = {
  slot: CalendarSlot
  minuteOfDay: number
}

export type TimeSlotsProps<TTag extends ElementType = 'span'> =
  PolymorphicProps<TTag, OwnProps<TimeSlotScope>>

export const TimeSlots = <TTag extends ElementType = 'span'>({
  as,
  children,
  style,
  ...rest
}: TimeSlotsProps<TTag>): ReactNode => {
  const { day } = useDayColumnContext()
  const Tag = tagOf(as, 'span')

  return (
    <>
      {day.slots.map((slot) => (
        <Tag
          key={slot.minuteOfDay}
          {...rest}
          style={styleOf(
            {
              position: 'absolute',
              left: 0,
              right: 0,
              top: minutePercentOf(slot.minuteOfDay)
            },
            style
          )}
        >
          {renderSlot(children, { slot, minuteOfDay: slot.minuteOfDay }, null)}
        </Tag>
      ))}
    </>
  )
}
