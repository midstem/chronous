import type { CalendarDay } from '@midstem/chronous'
import type { ElementType, ReactNode } from 'react'

import { useCalendarContext } from '../context'
import {
  WEEKDAY,
  labelOf,
  renderChildren,
  rowsWithDays,
  tagOf
} from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

export type MonthWeekdayScope<TData> = {
  day: CalendarDay<TData>
  weekday: string
}

export type MonthWeekdaysProps<
  TData,
  TTag extends ElementType = 'div'
> = PolymorphicProps<TTag, OwnProps<MonthWeekdayScope<TData>>>

export const MonthWeekdays = <TData, TTag extends ElementType = 'div'>({
  as,
  children,
  style,
  ...rest
}: MonthWeekdaysProps<TData, TTag>): ReactNode => {
  const { calendar, locale } = useCalendarContext<TData>()
  const Tag = tagOf(as, 'div')
  const first = rowsWithDays(calendar)[0]

  return (
    <>
      {first.days.map((day) => {
        const weekday = labelOf(day.date, locale, WEEKDAY)

        return (
          <Tag key={day.date} {...rest} style={style}>
            {renderChildren(children, { day, weekday }, weekday)}
          </Tag>
        )
      })}
    </>
  )
}
