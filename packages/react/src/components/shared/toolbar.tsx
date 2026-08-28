import type { ReactNode } from 'react'
import type { RangeSpec, ViewKind } from '@midstem/chronous'
import { formatIso } from '@midstem/chronous'
import { useCalendarContext } from '../context/calendar-context'
import { useCalendarNavigation } from '#src/navigation'
import type { CalendarNavigation } from '#src/navigation'

export type ToolbarProps = {
  onSpec: (spec: RangeSpec) => void
  views?: ViewKind[]
  children?: (ctx: {
    navigation: CalendarNavigation
    spec: RangeSpec
    title: string
  }) => ReactNode
  className?: string
}

const formatTitle = (spec: RangeSpec, locale: string): string => {
  try {
    return formatIso(spec.date, {
      locale,
      timeZone: spec.timeZone,
      options: {
        month: 'long',
        year: 'numeric',
        ...(spec.view !== 'month' && { day: 'numeric' })
      }
    })
  } catch {
    return spec.date
  }
}

export const Toolbar = ({
  onSpec,
  views = ['day', 'week', 'month', 'agenda'],
  children,
  className
}: ToolbarProps): ReactNode => {
  const { spec, locale } = useCalendarContext()
  const navigation = useCalendarNavigation(spec)
  const title = formatTitle(spec, locale)

  if (children) {
    return (
      <div className={className}>{children({ navigation, spec, title })}</div>
    )
  }

  return (
    <header
      className={className}
      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
    >
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          type="button"
          aria-label="Previous period"
          disabled={!navigation.prev}
          onClick={() => navigation.prev && onSpec(navigation.prev)}
        >
          ‹
        </button>
        <button
          type="button"
          disabled={!navigation.today}
          onClick={() => navigation.today && onSpec(navigation.today())}
        >
          Today
        </button>
        <button
          type="button"
          aria-label="Next period"
          disabled={!navigation.next}
          onClick={() => navigation.next && onSpec(navigation.next)}
        >
          ›
        </button>
      </div>

      <h2 style={{ flex: 1, textAlign: 'center', margin: 0 }}>{title}</h2>

      <div style={{ display: 'flex', gap: 4 }}>
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
      </div>
    </header>
  )
}
