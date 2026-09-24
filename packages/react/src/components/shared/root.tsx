import type { EventInput, LocaleId, CalendarRange } from '@midstem/chronous'
import type { ElementType, ReactNode } from 'react'

import { useCalendar } from '#src/calendar'
import type { CalendarError } from '#src/calendar'

import { CalendarProvider } from '../context'
import type { CalendarContextValue } from '../context'
import { GUTTER_WIDTH, renderChildren, tagOf } from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

const LOCALE: LocaleId = 'en-US'

export type RootOwnProps<TData> = OwnProps<CalendarContextValue<TData>> & {
  range: CalendarRange
  events: readonly EventInput<TData>[]
  locale?: LocaleId
  gutterWidth?: string
  renderError?: (error: CalendarError) => ReactNode
}

export type RootProps<
  TData,
  TTag extends ElementType = 'div'
> = PolymorphicProps<TTag, RootOwnProps<TData>>

export const Root = <TData, TTag extends ElementType = 'div'>({
  as,
  range,
  events,
  locale = LOCALE,
  gutterWidth = GUTTER_WIDTH,
  children,
  style,
  renderError,
  ...rest
}: RootProps<TData, TTag>): ReactNode => {
  const { calendar, error } = useCalendar(range, events)
  const Tag = tagOf(as, 'div')

  if (error) {
    if (!renderError) throw error

    return (
      <Tag {...rest} style={style}>
        {renderError(error)}
      </Tag>
    )
  }

  const scope: CalendarContextValue<TData> = {
    calendar,
    range,
    locale,
    gutterWidth
  }

  return (
    <Tag {...rest} style={style}>
      <CalendarProvider value={scope}>
        {renderChildren(children, scope, null)}
      </CalendarProvider>
    </Tag>
  )
}
