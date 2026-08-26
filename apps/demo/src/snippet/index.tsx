import type { EventInput, LocaleId, RangeSpec } from '@midstem/chronous'
import { useState } from 'react'
import type { ReactElement } from 'react'

import type { EventData } from '../types'

import {
  COPIED_LABEL,
  COPIED_MS,
  COPY_LABEL,
  FILE_NAME,
  SNIPPET_HINT
} from './constants'
import { snippetOf } from './helpers'

type SnippetProps = {
  spec: RangeSpec
  events: readonly EventInput<EventData>[]
  locale: LocaleId
  hourHeight: number
}

export const Snippet = ({
  spec,
  events,
  locale,
  hourHeight
}: SnippetProps): ReactElement => {
  const [copied, setCopied] = useState(false)
  const source = snippetOf(spec, events, locale, hourHeight)

  const copy = (): void => {
    void navigator.clipboard.writeText(source).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), COPIED_MS)
    })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col p-4">
      <header className="flex flex-wrap items-center gap-3 pb-3">
        <h2 className="font-mono text-lg font-semibold">{FILE_NAME}</h2>
        <span className="font-mono text-[11px] text-faint">
          {spec.view} · {hourHeight}px per hour · {locale} · {events.length}{' '}
          events
        </span>
        <button type="button" className="ghost-button ml-auto" onClick={copy}>
          {copied ? COPIED_LABEL : COPY_LABEL}
        </button>
      </header>

      <section className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <pre className="min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-5">
          {source}
        </pre>
      </section>

      <p className="pt-2 text-[11px] leading-4 text-muted">{SNIPPET_HINT}</p>
    </div>
  )
}
