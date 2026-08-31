import type { ElementType, ReactNode } from 'react'

import { useCalendarContext, useDayColumnContext } from '../context'
import { minutePercentOf, renderChildren, styleOf, tagOf } from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'
import { useNow } from './use-now'

const Z_INDEX = 10

export type NowMarkerScope = {
  minuteOfDay: number
}

export type NowMarkerProps<TTag extends ElementType = 'div'> = PolymorphicProps<
  TTag,
  OwnProps<NowMarkerScope>
>

export const NowMarker = <TTag extends ElementType = 'div'>({
  as,
  children,
  style,
  ...rest
}: NowMarkerProps<TTag>): ReactNode => {
  const { range } = useCalendarContext()
  const { day } = useDayColumnContext()
  const now = useNow(range.timeZone)
  const Tag = tagOf(as, 'div')

  if (!now || now.date !== day.date) return null

  return (
    <Tag
      {...rest}
      style={styleOf(
        {
          position: 'absolute',
          left: 0,
          right: 0,
          top: minutePercentOf(now.minuteOfDay),
          zIndex: Z_INDEX
        },
        style
      )}
    >
      {renderChildren(children, { minuteOfDay: now.minuteOfDay }, null)}
    </Tag>
  )
}
