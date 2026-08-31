import type { CalendarBox, TimedEntry } from '@midstem/chronous'
import type { ElementType, ReactNode } from 'react'

import { useMonthDayContext } from '../context'
import { renderSlot, tagOf } from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

export type MonthEntryScope<TData> = {
  event: TimedEntry<TData>
  box: CalendarBox<TData>
}

export type MonthEntriesProps<
  TData,
  TTag extends ElementType = 'div'
> = PolymorphicProps<TTag, OwnProps<MonthEntryScope<TData>>>

export const MonthEntries = <TData, TTag extends ElementType = 'div'>({
  as,
  children,
  style,
  ...rest
}: MonthEntriesProps<TData, TTag>): ReactNode => {
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
