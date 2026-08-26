import type { EventInput, LocaleId, RangeSpec } from '@midstem/chronous'
import type { ReactElement } from 'react'

import { Code } from '../code'
import type { EventData } from '../types'

import { FILE_NAME, SNIPPET_HINT, badgeOf } from './constants'
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
}: SnippetProps): ReactElement => (
  <Code
    fileName={FILE_NAME}
    badge={badgeOf(spec.view, hourHeight, locale, events.length)}
    hint={SNIPPET_HINT}
    source={snippetOf(spec, events, locale, hourHeight)}
  />
)
