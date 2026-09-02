import type { CalendarBox, TimedEntry } from '@midstem/chronous'
import type { ElementType, ReactNode } from 'react'

import { useAgendaDayContext, useCalendarContext } from '../context'
import { rangeOf, renderChildren, tagOf } from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

export type AgendaTimedEventScope<TData> = {
  event: TimedEntry<TData>
  box: CalendarBox<TData>
  timeRangeLabel: string
}

export type AgendaTimedEventsProps<
  TData,
  TTag extends ElementType = 'div'
> = PolymorphicProps<TTag, OwnProps<AgendaTimedEventScope<TData>>>

export const AgendaTimedEvents = <TData, TTag extends ElementType = 'div'>({
  as,
  children,
  style,
  ...rest
}: AgendaTimedEventsProps<TData, TTag>): ReactNode => {
  const { locale } = useCalendarContext()
  const { boxes } = useAgendaDayContext<TData>()
  const Tag = tagOf(as, 'div')

  return (
    <>
      {boxes.map((box) => {
        const timeRangeLabel = rangeOf(box.start, box.end, locale)

        return (
          <Tag
            key={`${box.event.id}-${box.startMinute}`}
            data-event-id={box.event.id}
            data-continues-before={box.continuesBefore}
            data-continues-after={box.continuesAfter}
            {...rest}
            style={style}
          >
            {renderChildren(
              children,
              { event: box.event, box, timeRangeLabel },
              timeRangeLabel
            )}
          </Tag>
        )
      })}
    </>
  )
}
