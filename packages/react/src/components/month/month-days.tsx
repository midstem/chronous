import type { CalendarBar, CalendarBox, CalendarDay } from '@midstem/chronous'
import type { ElementType, ReactNode } from 'react'

import {
  MonthDayProvider,
  useCalendarContext,
  useMonthRowContext
} from '../context'
import type { MonthDayContextValue } from '../context'
import {
  DAY_NUMBER,
  hiddenLanes,
  labelOf,
  laneCount,
  renderChildren,
  rowBarsByDay,
  tagOf
} from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

export type MonthDayScope<TData> = {
  day: CalendarDay<TData>
  boxes: CalendarBox<TData>[]
  bars: CalendarBar<TData>[]
  hiddenBars: CalendarBar<TData>[]
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
  const { row, days, maxLanes } = useMonthRowContext<TData>()
  const Tag = tagOf(as, 'div')
  const barsByDay = rowBarsByDay(row, days.length)

  return (
    <>
      {days.map((day, index) => {
        const dayNumber = labelOf(day.date, locale, DAY_NUMBER)
        const bars = barsByDay[index]
        const value: MonthDayContextValue<TData> = {
          day,
          boxes: day.boxes,
          bars,
          hiddenBars: hiddenLanes(bars, maxLanes)
        }

        return (
          <MonthDayProvider key={day.date} value={value}>
            <Tag
              data-date={day.date}
              data-in-period={day.inPeriod}
              {...rest}
              style={style}
            >
              {renderChildren(
                children,
                {
                  ...value,
                  dayNumber,
                  inPeriod: day.inPeriod,
                  lanes: laneCount(row.lanes, maxLanes)
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
