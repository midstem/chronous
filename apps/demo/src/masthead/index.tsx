import type { ReactElement } from 'react'

import { REPOSITORY_URL } from '../constants'
import { MODES } from '../mode'
import type { Mode } from '../mode'
import { Runtime } from '../runtime'
import { SchemeToggle } from '../theme'
import type { ColorScheme } from '../theme'

import {
  DOCS_LABEL,
  HEADLINE,
  MODE_LABEL,
  RESET_LABEL,
  TAGLINE
} from './constants'

type MastheadProps = {
  mode: Mode
  scheme: ColorScheme
  onMode: (mode: Mode) => void
  onReset: () => void
}

export const Masthead = ({
  mode,
  scheme,
  onMode,
  onReset
}: MastheadProps): ReactElement => (
  <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-line bg-surface px-4 py-2.5">
    <h1 className="flex items-baseline gap-2 text-base font-semibold">
      {HEADLINE}
      <span className="text-xs font-normal text-faint">{TAGLINE}</span>
    </h1>

    <div
      className="ml-4 flex items-center gap-0.5 rounded-md border border-line bg-raised p-0.5"
      role="group"
      aria-label={MODE_LABEL}
    >
      {MODES.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === mode}
          className={`rounded px-3 py-1 text-[13px] font-medium ${option.value === mode ? 'bg-accent-soft text-accent' : 'text-muted hover:text-ink'}`}
          onClick={() => onMode(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>

    <div className="ml-auto flex flex-wrap items-center gap-2">
      <Runtime />
      <SchemeToggle {...scheme} />
      <button type="button" className="ghost-button" onClick={onReset}>
        {RESET_LABEL}
      </button>
      <a
        className="ghost-button"
        href={REPOSITORY_URL}
        target="_blank"
        rel="noreferrer"
      >
        {DOCS_LABEL}
      </a>
    </div>
  </header>
)
