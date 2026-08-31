import type { ElementType, ReactNode } from 'react'
import { useEffect, useRef } from 'react'

import { TimeGridProvider, useCalendarContext } from '../context'
import type { TimeGridContextValue } from '../context'
import {
  HOURS_IN_DAY,
  renderSlot,
  styleOf,
  tagOf,
  templateOf
} from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'
import { scrollerOf } from './helpers'

const HOUR_HEIGHT = 60

const SCROLL_TO_HOUR = 7

export type TimeGridOwnProps = OwnProps<TimeGridContextValue> & {
  hourHeight?: number
  scrollToHour?: number | null
}

export type TimeGridProps<TTag extends ElementType = 'div'> = PolymorphicProps<
  TTag,
  TimeGridOwnProps
>

export const TimeGrid = <TTag extends ElementType = 'div'>({
  as,
  children,
  style,
  hourHeight = HOUR_HEIGHT,
  scrollToHour = SCROLL_TO_HOUR,
  ...rest
}: TimeGridProps<TTag>): ReactNode => {
  const { calendar, gutter } = useCalendarContext()
  const held = useRef<HTMLElement>(null)
  const Tag = tagOf(as, 'div')

  useEffect(() => {
    if (scrollToHour === null) return

    const scroller = scrollerOf(held.current)

    if (scroller) scroller.scrollTop = hourHeight * scrollToHour
  }, [hourHeight, scrollToHour])

  const scope: TimeGridContextValue = {
    hourHeight,
    dayHeight: hourHeight * HOURS_IN_DAY
  }

  return (
    <TimeGridProvider value={scope}>
      <Tag {...rest} ref={held} style={styleOf({ overflowY: 'auto' }, style)}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: templateOf(gutter, calendar.days.length)
          }}
        >
          {renderSlot(children, scope, null)}
        </div>
      </Tag>
    </TimeGridProvider>
  )
}
