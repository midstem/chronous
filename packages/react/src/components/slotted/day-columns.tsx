import type { ElementType, ReactNode } from 'react'

import {
  DayColumnProvider,
  useCalendarContext,
  useTimeGridContext
} from '../context'
import type { DayColumnContextValue } from '../context'
import { renderChildren, styleOf, tagOf } from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

export type DayColumnsProps<
  TData,
  TTag extends ElementType = 'div'
> = PolymorphicProps<TTag, OwnProps<DayColumnContextValue<TData>>>

export const DayColumns = <TData, TTag extends ElementType = 'div'>({
  as,
  children,
  style,
  ...rest
}: DayColumnsProps<TData, TTag>): ReactNode => {
  const { calendar } = useCalendarContext<TData>()
  const { dayHeight } = useTimeGridContext()
  const Tag = tagOf(as, 'div')

  return (
    <>
      {calendar.days.map((day) => (
        <DayColumnProvider key={day.date} value={{ day }}>
          <Tag
            data-date={day.date}
            data-in-period={day.inPeriod}
            {...rest}
            style={styleOf({ position: 'relative', height: dayHeight }, style)}
          >
            {renderChildren(children, { day }, null)}
          </Tag>
        </DayColumnProvider>
      ))}
    </>
  )
}
