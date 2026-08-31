import type { CalendarBar, CalendarEntry } from '@midstem/chronous'
import type { ElementType, ReactNode } from 'react'

import { useAgendaDayContext } from '../context'
import { renderChildren, tagOf } from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

export type AgendaAllDayEventScope<TData> = {
  event: CalendarEntry<TData>
  bar: CalendarBar<TData>
}

export type AgendaAllDayEventsProps<
  TData,
  TTag extends ElementType = 'div'
> = PolymorphicProps<TTag, OwnProps<AgendaAllDayEventScope<TData>>>

export const AgendaAllDayEvents = <TData, TTag extends ElementType = 'div'>({
  as,
  children,
  style,
  ...rest
}: AgendaAllDayEventsProps<TData, TTag>): ReactNode => {
  const { bars } = useAgendaDayContext<TData>()
  const Tag = tagOf(as, 'div')

  return (
    <>
      {bars.map((bar) => (
        <Tag
          key={`${bar.event.id}-${bar.startDay}`}
          data-event-id={bar.event.id}
          data-continues-before={bar.continuesBefore}
          data-continues-after={bar.continuesAfter}
          {...rest}
          style={style}
        >
          {renderChildren(children, { event: bar.event, bar }, bar.event.id)}
        </Tag>
      ))}
    </>
  )
}
