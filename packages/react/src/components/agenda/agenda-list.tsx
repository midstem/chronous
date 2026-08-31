import type { ElementType, ReactNode } from 'react'

import { useCalendarContext } from '../context'
import type { CalendarContextValue } from '../context'
import { renderChildren, tagOf } from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

export type AgendaListProps<
  TData,
  TTag extends ElementType = 'div'
> = PolymorphicProps<TTag, OwnProps<CalendarContextValue<TData>>>

export const AgendaList = <TData, TTag extends ElementType = 'div'>({
  as,
  children,
  style,
  ...rest
}: AgendaListProps<TData, TTag>): ReactNode => {
  const scope = useCalendarContext<TData>()
  const Tag = tagOf(as, 'div')

  return (
    <Tag {...rest} style={style}>
      {renderChildren(children, scope, null)}
    </Tag>
  )
}
