import type { CalendarBox, TimedEntry } from '@midstem/chronous'
import type { ElementType, ReactNode } from 'react'

import { useDayColumnContext } from '../context'
import { percentOf, renderSlot, styleOf, tagOf } from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

const MIN_HEIGHT = 22

const GAP = 3

export type TimedEventScope<TData> = {
  event: TimedEntry<TData>
  box: CalendarBox<TData>
}

export type TimedEventsOwnProps<TData> = OwnProps<TimedEventScope<TData>> & {
  minHeight?: number
  gap?: number
}

export type TimedEventsProps<
  TData,
  TTag extends ElementType = 'div'
> = PolymorphicProps<TTag, TimedEventsOwnProps<TData>>

export const TimedEvents = <TData, TTag extends ElementType = 'div'>({
  as,
  children,
  style,
  minHeight = MIN_HEIGHT,
  gap = GAP,
  ...rest
}: TimedEventsProps<TData, TTag>): ReactNode => {
  const { day } = useDayColumnContext<TData>()
  const Tag = tagOf(as, 'div')

  return (
    <>
      {day.boxes.map((box) => (
        <Tag
          key={`${box.event.id}-${box.startMinute}`}
          {...rest}
          style={styleOf(
            {
              position: 'absolute',
              overflow: 'hidden',
              top: percentOf(box.top),
              height: percentOf(box.height),
              left: percentOf(box.left),
              width: `calc(${percentOf(box.width)} - ${gap}px)`,
              minHeight
            },
            style
          )}
        >
          {renderSlot(children, { event: box.event, box }, box.event.id)}
        </Tag>
      ))}
    </>
  )
}
