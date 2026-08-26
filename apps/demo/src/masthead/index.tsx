import type { ReactElement } from 'react'

import { REPOSITORY_URL } from '../constants'
import { Runtime } from '../runtime'
import { SchemeToggle } from '../theme'
import type { ColorScheme } from '../theme'

import { DOCS_LABEL, HEADLINE, RESET_LABEL, TAGLINE } from './constants'

type MastheadProps = {
  scheme: ColorScheme
  onReset: () => void
}

export const Masthead = ({ scheme, onReset }: MastheadProps): ReactElement => (
  <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-line bg-surface px-4 py-2.5">
    <h1 className="flex items-baseline gap-2 text-base font-semibold">
      {HEADLINE}
      <span className="text-xs font-normal text-faint">{TAGLINE}</span>
    </h1>

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
