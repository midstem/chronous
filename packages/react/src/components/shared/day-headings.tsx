import type { CalendarDay, IsoDate } from '@midstem/chronous'
import type { ElementType, ReactNode } from 'react'

import { useCalendarContext } from '../context'
import { DAY_NUMBER, WEEKDAY, labelOf, renderChildren, tagOf } from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

export type DayHeadingScope<TData> = {
  day: CalendarDay<TData>
  date: IsoDate
  weekdayLabel: string
  dayLabel: string
  inCurrentPeriod: boolean
}

export type DayHeadingsProps<
  TData,
  TTag extends ElementType = 'div'
> = PolymorphicProps<TTag, OwnProps<DayHeadingScope<TData>>>

export const DayHeadings = <TData, TTag extends ElementType = 'div'>({
  as,
  children,
  style,
  ...rest
}: DayHeadingsProps<TData, TTag>): ReactNode => {
  const { calendar, locale } = useCalendarContext<TData>()
  const Tag = tagOf(as, 'div')

  return (
    <>
      {calendar.days.map((day) => {
        const weekdayLabel = labelOf(day.date, locale, WEEKDAY)
        const dayLabel = labelOf(day.date, locale, DAY_NUMBER)

        return (
          <Tag
            key={day.date}
            data-date={day.date}
            data-in-current-period={day.inCurrentPeriod}
            {...rest}
            style={style}
          >
            {renderChildren(
              children,
              {
                day,
                date: day.date,
                weekdayLabel,
                dayLabel,
                inCurrentPeriod: day.inCurrentPeriod
              },
              `${weekdayLabel} ${dayLabel}`
            )}
          </Tag>
        )
      })}
    </>
  )
}
