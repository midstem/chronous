import type { CalendarRange, ViewKind } from '@midstem/chronous'
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
  range: CalendarRange
  title: string
  goTo: (range: CalendarRange) => void
}

export type ToolbarOwnProps = OwnProps<ToolbarScope> & {
  onNavigate: (range: CalendarRange) => void
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
  onNavigate,
  views = VIEWS,
  ...rest
}: ToolbarProps<TTag>): ReactNode => {
  const { range, locale } = useCalendarContext()
  const navigation = useCalendarNavigation(range)
  const Tag = tagOf(as, 'div')
  const title = titleOf(range, locale)
  const { prev, next, today } = navigation

  if (children !== undefined) {
    return (
      <Tag {...rest} style={style}>
        {renderSlot(
          children,
          { navigation, range, title, goTo: onNavigate },
          null
        )}
      </Tag>
    )
  }

  return (
    <Tag {...rest} style={style}>
      <button
        type="button"
        aria-label="Previous period"
        disabled={!prev}
        onClick={() => prev && onNavigate(prev)}
      >
        ‹
      </button>
      <button
        type="button"
        disabled={!today}
        onClick={() => today && onNavigate(today())}
      >
        Today
      </button>
      <button
        type="button"
        aria-label="Next period"
        disabled={!next}
        onClick={() => next && onNavigate(next)}
      >
        ›
      </button>
      <span>{title}</span>
      {views.map((view) => (
        <button
          key={view}
          type="button"
          aria-pressed={view === range.view}
          onClick={() => onNavigate(navigation.withView(view))}
        >
          {view}
        </button>
      ))}
    </Tag>
  )
}
