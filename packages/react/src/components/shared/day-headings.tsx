import type { CalendarDay, IsoDate } from '@midstem/chronous'
import type { ElementType, ReactNode } from 'react'

import { useCalendarContext } from '../context'
import { DAY_NUMBER, WEEKDAY, labelOf, renderSlot, tagOf } from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

export type DayHeadingScope<TData> = {
  day: CalendarDay<TData>
  date: IsoDate
  weekday: string
  dayNumber: string
  inPeriod: boolean
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
        const weekday = labelOf(day.date, locale, WEEKDAY)
        const dayNumber = labelOf(day.date, locale, DAY_NUMBER)

        return (
          <Tag key={day.date} {...rest} style={style}>
            {renderSlot(
              children,
              {
                day,
                date: day.date,
                weekday,
                dayNumber,
                inPeriod: day.inPeriod
              },
              `${weekday} ${dayNumber}`
            )}
          </Tag>
        )
      })}
    </>
  )
}
