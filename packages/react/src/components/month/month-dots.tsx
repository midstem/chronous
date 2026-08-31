import type { CalendarBox, TimedEntry } from '@midstem/chronous'
import type { ElementType, ReactNode } from 'react'

import { useMonthDayContext } from '../context'
import { renderSlot, styleOf, tagOf } from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

const SIZE = 6

export type MonthDotScope<TData> = {
  event: TimedEntry<TData>
  box: CalendarBox<TData>
}

export type MonthDotsOwnProps<TData> = OwnProps<MonthDotScope<TData>> & {
  size?: number
}

export type MonthDotsProps<
  TData,
  TTag extends ElementType = 'span'
> = PolymorphicProps<TTag, MonthDotsOwnProps<TData>>

export const MonthDots = <TData, TTag extends ElementType = 'span'>({
  as,
  children,
  style,
  size = SIZE,
  ...rest
}: MonthDotsProps<TData, TTag>): ReactNode => {
  const { boxes } = useMonthDayContext<TData>()
  const Tag = tagOf(as, 'span')

  return (
    <>
      {boxes.map((box) => (
        <Tag
          key={`${box.event.id}-${box.startMinute}`}
          {...rest}
          style={styleOf(
            {
              display: 'inline-block',
              width: size,
              height: size,
              borderRadius: '50%',
              backgroundColor: 'currentColor'
            },
            style
          )}
        >
          {renderSlot(children, { event: box.event, box }, null)}
        </Tag>
      ))}
    </>
  )
}
