import type { CalendarBox, TimedEntry } from '@midstem/chronous'
import type { ElementType, ReactNode } from 'react'

import { useMonthDayContext } from '../context'
import { renderSlot, tagOf } from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

export type MonthTimedEventScope<TData> = {
  event: TimedEntry<TData>
  box: CalendarBox<TData>
}

export type MonthTimedEventsProps<
  TData,
  TTag extends ElementType = 'div'
> = PolymorphicProps<TTag, OwnProps<MonthTimedEventScope<TData>>>

export const MonthTimedEvents = <TData, TTag extends ElementType = 'div'>({
  as,
  children,
  style,
  ...rest
}: MonthTimedEventsProps<TData, TTag>): ReactNode => {
  const { boxes } = useMonthDayContext<TData>()
  const Tag = tagOf(as, 'div')

  return (
    <>
      {boxes.map((box) => (
        <Tag
          key={`${box.event.id}-${box.startMinute}`}
          data-event-id={box.event.id}
          {...rest}
          style={style}
        >
          {renderSlot(children, { event: box.event, box }, box.event.id)}
        </Tag>
      ))}
    </>
  )
}
