import type { ElementType, ReactNode } from 'react'

import { useCalendarContext } from '../context'
import type { CalendarContextValue } from '../context'
import { renderChildren, styleOf, tagOf, templateOf } from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

export type HeaderOwnProps<TData> = OwnProps<CalendarContextValue<TData>> & {
  gutterCell?: ReactNode
}

export type HeaderProps<
  TData,
  TTag extends ElementType = 'div'
> = PolymorphicProps<TTag, HeaderOwnProps<TData>>

export const Header = <TData, TTag extends ElementType = 'div'>({
  as,
  children,
  style,
  gutterCell = null,
  ...rest
}: HeaderProps<TData, TTag>): ReactNode => {
  const scope = useCalendarContext<TData>()
  const Tag = tagOf(as, 'div')

  return (
    <Tag
      {...rest}
      style={styleOf(
        {
          display: 'grid',
          gridTemplateColumns: templateOf(
            scope.gutterWidth,
            scope.calendar.days.length
          )
        },
        style
      )}
    >
      <div>{gutterCell}</div>
      {renderChildren(children, scope, null)}
    </Tag>
  )
}
