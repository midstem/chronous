import type { ElementType, ReactNode } from 'react'

import { useTimeGridContext } from '../context'
import type { TimeGridContextValue } from '../context'
import { renderSlot, styleOf, tagOf } from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

export type TimeAxisProps<TTag extends ElementType = 'div'> = PolymorphicProps<
  TTag,
  OwnProps<TimeGridContextValue>
>

export const TimeAxis = <TTag extends ElementType = 'div'>({
  as,
  children,
  style,
  ...rest
}: TimeAxisProps<TTag>): ReactNode => {
  const scope = useTimeGridContext()
  const Tag = tagOf(as, 'div')

  return (
    <Tag
      {...rest}
      style={styleOf({ position: 'relative', height: scope.dayHeight }, style)}
    >
      {renderSlot(children, scope, null)}
    </Tag>
  )
}
