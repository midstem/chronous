import type { ElementType, ReactNode } from 'react'

import { MonthRowProvider, useCalendarContext } from '../context'
import type { MonthRowContextValue } from '../context'
import { columnsOf, renderSlot, rowsWithDays, styleOf, tagOf } from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

export type MonthRowsProps<
  TData,
  TTag extends ElementType = 'div'
> = PolymorphicProps<TTag, OwnProps<MonthRowContextValue<TData>>>

export const MonthRows = <TData, TTag extends ElementType = 'div'>({
  as,
  children,
  style,
  ...rest
}: MonthRowsProps<TData, TTag>): ReactNode => {
  const { calendar } = useCalendarContext<TData>()
  const Tag = tagOf(as, 'div')

  return (
    <>
      {rowsWithDays(calendar).map((scope) => (
        <MonthRowProvider key={scope.row.start} value={scope}>
          <Tag
            {...rest}
            style={styleOf(
              {
                position: 'relative',
                flex: 1,
                display: 'grid',
                gridTemplateColumns: columnsOf(scope.days.length)
              },
              style
            )}
          >
            {renderSlot(children, scope, null)}
          </Tag>
        </MonthRowProvider>
      ))}
    </>
  )
}
