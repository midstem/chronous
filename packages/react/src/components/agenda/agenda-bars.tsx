import type { CalendarBar, CalendarEntry } from '@midstem/chronous'
import type { ElementType, ReactNode } from 'react'

import { useAgendaDayContext } from '../context'
import { renderSlot, tagOf } from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

export type AgendaBarScope<TData> = {
  event: CalendarEntry<TData>
  bar: CalendarBar<TData>
}

export type AgendaBarsProps<
  TData,
  TTag extends ElementType = 'div'
> = PolymorphicProps<TTag, OwnProps<AgendaBarScope<TData>>>

export const AgendaBars = <TData, TTag extends ElementType = 'div'>({
  as,
  children,
  style,
  ...rest
}: AgendaBarsProps<TData, TTag>): ReactNode => {
  const { bars } = useAgendaDayContext<TData>()
  const Tag = tagOf(as, 'div')

  return (
    <>
      {bars.map((bar) => (
        <Tag key={`${bar.event.id}-${bar.startDay}`} {...rest} style={style}>
          {renderSlot(children, { event: bar.event, bar }, bar.event.id)}
        </Tag>
      ))}
    </>
  )
}
