import type { ElementType, ReactNode } from 'react'

import { AllDayProvider, useCalendarContext } from '../context'
import type { AllDayContextValue } from '../context'
import { renderChildren, styleOf, tagOf, templateOf } from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

const LANE_HEIGHT = 24

const MIN_LANES = 0

export type AllDayRowOwnProps<TData> = OwnProps<AllDayContextValue<TData>> & {
  laneHeight?: number
  minLanes?: number
  gutterCell?: ReactNode
}

export type AllDayRowProps<
  TData,
  TTag extends ElementType = 'div'
> = PolymorphicProps<TTag, AllDayRowOwnProps<TData>>

export const AllDayRow = <TData, TTag extends ElementType = 'div'>({
  as,
  children,
  style,
  laneHeight = LANE_HEIGHT,
  minLanes = MIN_LANES,
  gutterCell = null,
  ...rest
}: AllDayRowProps<TData, TTag>): ReactNode => {
  const { calendar, gutterWidth } = useCalendarContext<TData>()
  const Tag = tagOf(as, 'div')
  const row = calendar.rows[0]
  const lanes = Math.max(row.lanes, minLanes)

  if (lanes === 0) return null

  const scope: AllDayContextValue<TData> = { row, laneHeight, lanes }

  return (
    <AllDayProvider value={scope}>
      <Tag
        {...rest}
        style={styleOf(
          {
            display: 'grid',
            gridTemplateColumns: templateOf(gutterWidth, calendar.days.length)
          },
          style
        )}
      >
        <div>{gutterCell}</div>
        <div
          style={{
            gridColumn: '2 / -1',
            position: 'relative',
            height: lanes * laneHeight
          }}
        >
          {renderChildren(children, scope, null)}
        </div>
      </Tag>
    </AllDayProvider>
  )
}
