import type { RangeSpec, ViewKind } from '@midstem/chronous'
import type { CalendarNavigation } from '@midstem/chronous-react'
import type { ReactElement } from 'react'

import { DENSITIES } from '../density'
import type { Density } from '../density'

import { BACK_LABEL, DENSITY_LABEL, NEXT_LABEL, VIEWS } from './constants'

type ToolbarProps = {
  navigation: CalendarNavigation
  title: string
  view: ViewKind
  density: Density
  slotted: boolean
  onChange: (spec: RangeSpec) => void
  onDensity: (density: Density) => void
}

export const Toolbar = ({
  navigation,
  title,
  view,
  density,
  slotted,
  onChange,
  onDensity
}: ToolbarProps): ReactElement => (
  <header className="flex flex-wrap items-center gap-3 pb-3">
    <div className="flex items-center gap-1">
      <button
        type="button"
        className="ghost-button"
        aria-label={BACK_LABEL}
        disabled={!navigation.prev}
        onClick={() => navigation.prev && onChange(navigation.prev)}
      >
        ‹
      </button>
      <button
        type="button"
        className="ghost-button"
        disabled={!navigation.today}
        onClick={() => navigation.today && onChange(navigation.today())}
      >
        Today
      </button>
      <button
        type="button"
        className="ghost-button"
        aria-label={NEXT_LABEL}
        disabled={!navigation.next}
        onClick={() => navigation.next && onChange(navigation.next)}
      >
        ›
      </button>
    </div>

    <h2 className="mr-auto truncate text-lg font-semibold">{title}</h2>

    {slotted && (
      <div
        className="flex items-center gap-0.5 rounded-md border border-line bg-surface p-0.5"
        role="group"
        aria-label={DENSITY_LABEL}
      >
        {DENSITIES.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={option.value === density}
            className={`rounded px-2 py-1 text-xs font-medium ${option.value === density ? 'bg-accent-soft text-accent' : 'text-muted hover:text-ink'}`}
            onClick={() => onDensity(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    )}

    <div className="flex items-center gap-0.5 rounded-md border border-line bg-surface p-0.5">
      {VIEWS.map((kind) => (
        <button
          key={kind}
          type="button"
          aria-pressed={kind === view}
          className={`rounded px-2.5 py-1 text-xs font-medium capitalize ${kind === view ? 'bg-accent-soft text-accent' : 'text-muted hover:text-ink'}`}
          onClick={() => onChange(navigation.withView(kind))}
        >
          {kind}
        </button>
      ))}
    </div>
  </header>
)
