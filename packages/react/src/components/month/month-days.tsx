import type { CalendarBox, CalendarDay } from '@midstem/chronous'
import type { ElementType, ReactNode } from 'react'

import {
  MonthDayProvider,
  useCalendarContext,
  useMonthRowContext
} from '../context'
import { DAY_NUMBER, labelOf, renderChildren, tagOf } from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

export type MonthDayScope<TData> = {
  day: CalendarDay<TData>
  boxes: CalendarBox<TData>[]
  dayNumber: string
  inPeriod: boolean
  lanes: number
}

export type MonthDaysProps<
  TData,
  TTag extends ElementType = 'div'
> = PolymorphicProps<TTag, OwnProps<MonthDayScope<TData>>>

export const MonthDays = <TData, TTag extends ElementType = 'div'>({
  as,
  children,
  style,
  ...rest
}: MonthDaysProps<TData, TTag>): ReactNode => {
  const { locale } = useCalendarContext<TData>()
  const { row, days } = useMonthRowContext<TData>()
  const Tag = tagOf(as, 'div')

  return (
    <>
      {days.map((day) => {
        const dayNumber = labelOf(day.date, locale, DAY_NUMBER)

        return (
          <MonthDayProvider key={day.date} value={{ day, boxes: day.boxes }}>
            <Tag
              data-date={day.date}
              data-in-period={day.inPeriod}
              {...rest}
              style={style}
            >
              {renderChildren(
                children,
                {
                  day,
                  boxes: day.boxes,
                  dayNumber,
                  inPeriod: day.inPeriod,
                  lanes: row.lanes
                },
                dayNumber
              )}
            </Tag>
          </MonthDayProvider>
        )
      })}
    </>
  )
}
