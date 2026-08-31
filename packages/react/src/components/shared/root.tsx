import type { EventInput, LocaleId, RangeSpec } from '@midstem/chronous'
import type { ElementType, ReactNode } from 'react'

import { useCalendar } from '#src/calendar'
import type { CalendarError } from '#src/calendar'

import { CalendarProvider } from '../context'
import type { CalendarContextValue } from '../context'
import { GUTTER, renderSlot, tagOf } from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'

const LOCALE: LocaleId = 'en-US'

export type RootOwnProps<TData> = OwnProps<CalendarContextValue<TData>> & {
  spec: RangeSpec
  events: readonly EventInput<TData>[]
  locale?: LocaleId
  gutter?: string
  fallback?: (error: CalendarError) => ReactNode
}

export type RootProps<
  TData,
  TTag extends ElementType = 'div'
> = PolymorphicProps<TTag, RootOwnProps<TData>>

export const Root = <TData, TTag extends ElementType = 'div'>({
  as,
  spec,
  events,
  locale = LOCALE,
  gutter = GUTTER,
  children,
  style,
  fallback,
  ...rest
}: RootProps<TData, TTag>): ReactNode => {
  const { calendar, error } = useCalendar(spec, events)
  const Tag = tagOf(as, 'div')

  if (error) {
    if (!fallback) throw error

    return (
      <Tag {...rest} style={style}>
        {fallback(error)}
      </Tag>
    )
  }

  const scope: CalendarContextValue<TData> = { calendar, spec, locale, gutter }

  return (
    <Tag {...rest} style={style}>
      <CalendarProvider value={scope}>
        {renderSlot(children, scope, null)}
      </CalendarProvider>
    </Tag>
  )
}
