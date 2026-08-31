import type { CalendarBar, CalendarEntry } from '@midstem/chronous'
import type { ElementType, ReactNode } from 'react'

import { useMonthRowContext } from '../context'
import { percentOf, renderSlot, styleOf, tagOf } from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

const LANE_HEIGHT = 20

const GAP = 4

const TOP_OFFSET = 28

const Z_INDEX = 1

export type MonthAllDayEventScope<TData> = {
  event: CalendarEntry<TData>
  bar: CalendarBar<TData>
}

export type MonthAllDayEventsOwnProps<TData> = OwnProps<
  MonthAllDayEventScope<TData>
> & {
  laneHeight?: number
  gap?: number
  topOffset?: number
}

export type MonthAllDayEventsProps<
  TData,
  TTag extends ElementType = 'div'
> = PolymorphicProps<TTag, MonthAllDayEventsOwnProps<TData>>

export const MonthAllDayEvents = <TData, TTag extends ElementType = 'div'>({
  as,
  children,
  style,
  laneHeight = LANE_HEIGHT,
  gap = GAP,
  topOffset = TOP_OFFSET,
  ...rest
}: MonthAllDayEventsProps<TData, TTag>): ReactNode => {
  const { row } = useMonthRowContext<TData>()
  const Tag = tagOf(as, 'div')

  return (
    <>
      {row.bars.map((bar) => (
        <Tag
          key={`${bar.event.id}-${bar.startDay}`}
          data-event-id={bar.event.id}
          data-continues-before={bar.continuesBefore}
          data-continues-after={bar.continuesAfter}
          {...rest}
          style={styleOf(
            {
              position: 'absolute',
              left: `calc(${percentOf(bar.left)} + ${gap / 2}px)`,
              width: `calc(${percentOf(bar.width)} - ${gap}px)`,
              top: topOffset + bar.lane * laneHeight,
              height: laneHeight,
              zIndex: Z_INDEX
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
