import type { LocaleId, RangeSpec } from '@midstem/chronous'
import type { ReactElement } from 'react'

import { SNIPPET_HINT } from './constants'
import { snippetOf } from './helpers'

type SnippetProps = {
  spec: RangeSpec
  locale: LocaleId
}

export const Snippet = ({ spec, locale }: SnippetProps): ReactElement => (
  <section className="card">
    <h2 className="card-title">
      Code
      <span className="panel-badge">what this board runs</span>
    </h2>
    <p className="field-hint">{SNIPPET_HINT}</p>
    <pre className="code">{snippetOf(spec, locale)}</pre>
  </section>
)
