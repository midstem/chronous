import type { ElementType, ReactNode } from 'react'

import { AgendaDayProvider, useCalendarContext } from '../context'
import type { AgendaDayContextValue } from '../context'
import {
  DAY_NUMBER,
  MONTH,
  WEEKDAY,
  barsByDay,
  labelOf,
  renderSlot,
  tagOf
} from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

export type AgendaDayScope<TData> = AgendaDayContextValue<TData> & {
  weekday: string
  dayNumber: string
  month: string
}

export type AgendaDaysOwnProps<TData> = OwnProps<AgendaDayScope<TData>> & {
  showEmpty?: boolean
}

export type AgendaDaysProps<
  TData,
  TTag extends ElementType = 'div'
> = PolymorphicProps<TTag, AgendaDaysOwnProps<TData>>

export const AgendaDays = <TData, TTag extends ElementType = 'div'>({
  as,
  children,
  style,
  showEmpty = false,
  ...rest
}: AgendaDaysProps<TData, TTag>): ReactNode => {
  const { calendar, locale } = useCalendarContext<TData>()
  const Tag = tagOf(as, 'div')
  const bars = barsByDay(calendar)

  return (
    <>
      {calendar.days.map((day, index) => {
        const onDay = bars[index]

        if (!showEmpty && onDay.length === 0 && day.boxes.length === 0) {
          return null
        }

        const value: AgendaDayContextValue<TData> = {
          day,
          bars: onDay,
          boxes: day.boxes
        }

        const scope: AgendaDayScope<TData> = {
          ...value,
          weekday: labelOf(day.date, locale, WEEKDAY),
          dayNumber: labelOf(day.date, locale, DAY_NUMBER),
          month: labelOf(day.date, locale, MONTH)
        }

        return (
          <AgendaDayProvider key={day.date} value={value}>
            <Tag {...rest} style={style}>
              {renderSlot(children, scope, scope.dayNumber)}
            </Tag>
          </AgendaDayProvider>
        )
      })}
    </>
  )
}
