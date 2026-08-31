import type { RangeSpec, ViewKind } from '@midstem/chronous'
import type { ElementType, ReactNode } from 'react'

import { useCalendarNavigation } from '#src/navigation'
import type { CalendarNavigation } from '#src/navigation'

import { useCalendarContext } from '../context'
import { renderSlot, tagOf } from '../helpers'
import type { OwnProps, PolymorphicProps } from '../types'
import { titleOf } from './helpers'

const VIEWS: ViewKind[] = ['day', 'week', 'month', 'agenda']

export type ToolbarScope = {
  navigation: CalendarNavigation
  spec: RangeSpec
  title: string
}

export type ToolbarOwnProps = OwnProps<ToolbarScope> & {
  onSpec: (spec: RangeSpec) => void
  views?: readonly ViewKind[]
}

export type ToolbarProps<TTag extends ElementType = 'div'> = PolymorphicProps<
  TTag,
  ToolbarOwnProps
>

export const Toolbar = <TTag extends ElementType = 'div'>({
  as,
  children,
  style,
  onSpec,
  views = VIEWS,
  ...rest
}: ToolbarProps<TTag>): ReactNode => {
  const { spec, locale } = useCalendarContext()
  const navigation = useCalendarNavigation(spec)
  const Tag = tagOf(as, 'div')
  const title = titleOf(spec, locale)
  const { prev, next, today } = navigation

  if (children !== undefined) {
    return (
      <Tag {...rest} style={style}>
        {renderSlot(children, { navigation, spec, title }, null)}
      </Tag>
    )
  }

  return (
    <Tag {...rest} style={style}>
      <button
        type="button"
        aria-label="Previous period"
        disabled={!prev}
        onClick={() => prev && onSpec(prev)}
      >
        ‹
      </button>
      <button
        type="button"
        disabled={!today}
        onClick={() => today && onSpec(today())}
      >
        Today
      </button>
      <button
        type="button"
        aria-label="Next period"
        disabled={!next}
        onClick={() => next && onSpec(next)}
      >
        ›
      </button>
      <span>{title}</span>
      {views.map((view) => (
        <button
          key={view}
          type="button"
          aria-pressed={view === spec.view}
          onClick={() => onSpec(navigation.withView(view))}
        >
          {view}
        </button>
      ))}
    </Tag>
  )
}
