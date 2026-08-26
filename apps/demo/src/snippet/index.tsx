import type { EventInput, LocaleId, RangeSpec } from '@midstem/chronous'
import { useState } from 'react'
import type { ReactElement } from 'react'

import type { EventData } from '../types'

import { COPIED_LABEL, COPIED_MS, COPY_LABEL, SNIPPET_HINT } from './constants'
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
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] leading-4 text-muted">{SNIPPET_HINT}</p>
        <button type="button" className="ghost-button shrink-0" onClick={copy}>
          {copied ? COPIED_LABEL : COPY_LABEL}
        </button>
      </div>
      <pre className="min-h-0 flex-1 overflow-auto rounded-md border border-line bg-sunken p-3 font-mono text-[11px] leading-5">
        {source}
      </pre>
    </div>
  )
}
