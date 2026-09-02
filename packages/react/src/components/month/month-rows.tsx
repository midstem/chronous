import type { ElementType, ReactNode } from 'react'

import { MonthRowProvider, useCalendarContext } from '../context'
import type { MonthRowContextValue } from '../context'
import {
  columnsOf,
  renderChildren,
  rowsWithDays,
  styleOf,
  tagOf
} from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

const MAX_LANES = null

export type MonthRowsOwnProps<TData> = OwnProps<MonthRowContextValue<TData>> & {
  maxLanes?: number | null
}

export type MonthRowsProps<
  TData,
  TTag extends ElementType = 'div'
> = PolymorphicProps<TTag, MonthRowsOwnProps<TData>>

export const MonthRows = <TData, TTag extends ElementType = 'div'>({
  as,
  children,
  style,
  maxLanes = MAX_LANES,
  ...rest
}: MonthRowsProps<TData, TTag>): ReactNode => {
  const { calendar } = useCalendarContext<TData>()
  const Tag = tagOf(as, 'div')

  return (
    <>
      {rowsWithDays(calendar).map(({ row, days }) => {
        const scope: MonthRowContextValue<TData> = { row, days, maxLanes }

        return (
          <MonthRowProvider key={row.start} value={scope}>
            <Tag
              {...rest}
              style={styleOf(
                {
                  position: 'relative',
                  flex: 1,
                  display: 'grid',
                  gridTemplateColumns: columnsOf(days.length)
                },
                style
              )}
            >
              {renderChildren(children, scope, null)}
            </Tag>
          </MonthRowProvider>
        )
      })}
    </>
  )
}
