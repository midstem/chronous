import type { ElementType, ReactNode } from 'react'

import { AllDayProvider, useCalendarContext } from '../context'
import type { AllDayContextValue } from '../context'
import { renderSlot, styleOf, tagOf, templateOf } from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

const LANE_HEIGHT = 24

export type AllDayRowOwnProps<TData> = OwnProps<AllDayContextValue<TData>> & {
  laneHeight?: number
  label?: ReactNode
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
  label = null,
  ...rest
}: AllDayRowProps<TData, TTag>): ReactNode => {
  const { calendar, gutter } = useCalendarContext<TData>()
  const Tag = tagOf(as, 'div')
  const row = calendar.rows[0]

  if (row.lanes === 0) return null

  const scope: AllDayContextValue<TData> = { row, laneHeight }

  return (
    <AllDayProvider value={scope}>
      <Tag
        {...rest}
        style={styleOf(
          {
            display: 'grid',
            gridTemplateColumns: templateOf(gutter, calendar.days.length)
          },
          style
        )}
      >
        <div>{label}</div>
        <div
          style={{
            gridColumn: '2 / -1',
            position: 'relative',
            height: row.lanes * laneHeight
          }}
        >
          {renderSlot(children, scope, null)}
        </div>
      </Tag>
    </AllDayProvider>
  )
}
