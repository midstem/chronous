import type { ElementType, ReactNode } from 'react'

import { AgendaDayProvider, useCalendarContext } from '../context'
import type { AgendaDayContextValue } from '../context'
import {
  DAY_NUMBER,
  MONTH,
  WEEKDAY,
  barsByDay,
  labelOf,
  renderChildren,
  tagOf
} from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

export type AgendaDayScope<TData> = AgendaDayContextValue<TData> & {
  weekdayLabel: string
  dayLabel: string
  monthLabel: string
}

export type AgendaDaysOwnProps<TData> = OwnProps<AgendaDayScope<TData>> & {
  showEmptyDays?: boolean
}

export type AgendaDaysProps<
  TData,
  TTag extends ElementType = 'div'
> = PolymorphicProps<TTag, AgendaDaysOwnProps<TData>>

export const AgendaDays = <TData, TTag extends ElementType = 'div'>({
  as,
  children,
  style,
  showEmptyDays = false,
  ...rest
}: AgendaDaysProps<TData, TTag>): ReactNode => {
  const { calendar, locale } = useCalendarContext<TData>()
  const Tag = tagOf(as, 'div')
  const bars = barsByDay(calendar)

  return (
    <>
      {calendar.days.map((day, index) => {
        const onDay = bars[index]

        if (!showEmptyDays && onDay.length === 0 && day.boxes.length === 0) {
          return null
        }

        const value: AgendaDayContextValue<TData> = {
          day,
          bars: onDay,
          boxes: day.boxes
        }

        const scope: AgendaDayScope<TData> = {
          ...value,
          weekdayLabel: labelOf(day.date, locale, WEEKDAY),
          dayLabel: labelOf(day.date, locale, DAY_NUMBER),
          monthLabel: labelOf(day.date, locale, MONTH)
        }

        return (
          <AgendaDayProvider key={day.date} value={value}>
            <Tag
              data-date={day.date}
              data-in-current-period={day.inCurrentPeriod}
              {...rest}
              style={style}
            >
              {renderChildren(children, scope, scope.dayLabel)}
            </Tag>
          </AgendaDayProvider>
        )
      })}
    </>
  )
}
