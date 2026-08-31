import type { CalendarBox, TimedEntry } from '@midstem/chronous'
import type { ElementType, ReactNode } from 'react'

import { useAgendaDayContext, useCalendarContext } from '../context'
import { rangeOf, renderSlot, tagOf } from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

export type AgendaBoxScope<TData> = {
  event: TimedEntry<TData>
  box: CalendarBox<TData>
  timeRange: string
}

export type AgendaBoxesProps<
  TData,
  TTag extends ElementType = 'div'
> = PolymorphicProps<TTag, OwnProps<AgendaBoxScope<TData>>>

export const AgendaBoxes = <TData, TTag extends ElementType = 'div'>({
  as,
  children,
  style,
  ...rest
}: AgendaBoxesProps<TData, TTag>): ReactNode => {
  const { locale } = useCalendarContext()
  const { boxes } = useAgendaDayContext<TData>()
  const Tag = tagOf(as, 'div')

  return (
    <>
      {boxes.map((box) => {
        const timeRange = rangeOf(box.start, box.end, locale)

        return (
          <Tag
            key={`${box.event.id}-${box.startMinute}`}
            data-event-id={box.event.id}
            data-continues-before={box.continuesBefore}
            data-continues-after={box.continuesAfter}
            {...rest}
            style={style}
          >
            {renderSlot(
              children,
              { event: box.event, box, timeRange },
              timeRange
            )}
          </Tag>
        )
      })}
    </>
  )
}
