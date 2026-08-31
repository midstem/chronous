import type { CalendarBar, CalendarEntry } from '@midstem/chronous'
import type { ElementType, ReactNode } from 'react'

import { useAllDayContext } from '../context'
import { percentOf, renderSlot, styleOf, tagOf } from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

const GAP = 4

export type AllDayEventScope<TData> = {
  event: CalendarEntry<TData>
  bar: CalendarBar<TData>
}

export type AllDayEventsOwnProps<TData> = OwnProps<AllDayEventScope<TData>> & {
  gap?: number
}

export type AllDayEventsProps<
  TData,
  TTag extends ElementType = 'div'
> = PolymorphicProps<TTag, AllDayEventsOwnProps<TData>>

export const AllDayEvents = <TData, TTag extends ElementType = 'div'>({
  as,
  children,
  style,
  gap = GAP,
  ...rest
}: AllDayEventsProps<TData, TTag>): ReactNode => {
  const { row, laneHeight } = useAllDayContext<TData>()
  const Tag = tagOf(as, 'div')

  return (
    <>
      {row.bars.map((bar) => (
        <Tag
          key={`${bar.event.id}-${bar.startDay}`}
          {...rest}
          style={styleOf(
            {
              position: 'absolute',
              left: `calc(${percentOf(bar.left)} + ${gap / 2}px)`,
              width: `calc(${percentOf(bar.width)} - ${gap}px)`,
              top: bar.lane * laneHeight,
              height: laneHeight
            },
            style
          )}
        >
          {renderSlot(children, { event: bar.event, bar }, bar.event.id)}
        </Tag>
      ))}
    </>
  )
}
