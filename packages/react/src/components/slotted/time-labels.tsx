import type { CalendarSlot } from '@midstem/chronous'
import type { ElementType, ReactNode } from 'react'

import { useCalendarContext } from '../context'
import {
  CLOCK,
  labelOf,
  minutePercentOf,
  renderChildren,
  styleOf,
  tagOf
} from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

export type TimeLabelScope = {
  slot: CalendarSlot
  minuteOfDay: number
  time: string
}

export type TimeLabelsProps<TTag extends ElementType = 'div'> =
  PolymorphicProps<TTag, OwnProps<TimeLabelScope>>

export const TimeLabels = <TTag extends ElementType = 'div'>({
  as,
  children,
  style,
  ...rest
}: TimeLabelsProps<TTag>): ReactNode => {
  const { calendar, locale } = useCalendarContext()
  const Tag = tagOf(as, 'div')
  const day = calendar.days[0]

  return (
    <>
      {day.slots.map((slot) => {
        const time = labelOf(slot.start, locale, CLOCK)

        return (
          <Tag
            key={slot.minuteOfDay}
            {...rest}
            style={styleOf(
              {
                position: 'absolute',
                top: minutePercentOf(slot.minuteOfDay),
                transform: 'translateY(-50%)'
              },
              style
            )}
          >
            {renderChildren(
              children,
              { slot, minuteOfDay: slot.minuteOfDay, time },
              time
            )}
          </Tag>
        )
      })}
    </>
  )
}
