import type { ElementType, ReactNode } from 'react'

import { useCalendarContext } from '../context'
import type { CalendarContextValue } from '../context'
import { renderSlot, styleOf, tagOf } from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

export type MonthGridProps<
  TData,
  TTag extends ElementType = 'div'
> = PolymorphicProps<TTag, OwnProps<CalendarContextValue<TData>>>

export const MonthGrid = <TData, TTag extends ElementType = 'div'>({
  as,
  children,
  style,
  ...rest
}: MonthGridProps<TData, TTag>): ReactNode => {
  const scope = useCalendarContext<TData>()
  const Tag = tagOf(as, 'div')

  return (
    <Tag
      {...rest}
      style={styleOf(
        { display: 'flex', flexDirection: 'column', minHeight: '100%' },
        style
      )}
    >
      {renderSlot(children, scope, null)}
    </Tag>
  )
}
