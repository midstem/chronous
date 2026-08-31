import type { EventInput, LocaleId, RangeSpec } from '@midstem/chronous'
import type { ReactElement } from 'react'

import { Code } from '../code'
import { SIMPLE_HINT, simpleBadgeOf, simpleOf } from '../simple'
import { isSimple } from '../style'
import type { Style } from '../style'
import type { EventData } from '../types'

import { FILE_NAME, SNIPPET_HINT, badgeOf } from './constants'
import { snippetOf } from './helpers'

type SnippetProps = {
  spec: RangeSpec
  events: readonly EventInput<EventData>[]
  locale: LocaleId
  hourHeight: number
  style: Style
}

export const Snippet = ({
  spec,
  events,
  locale,
  hourHeight,
  style
}: SnippetProps): ReactElement =>
  isSimple(style) ? (
    <Code
      fileName={FILE_NAME}
      badge={simpleBadgeOf(spec.view, events.length)}
      hint={SIMPLE_HINT}
      source={simpleOf(spec, events, locale, hourHeight)}
    />
  ) : (
    <Code
      fileName={FILE_NAME}
      badge={badgeOf(spec.view, hourHeight, locale, events.length)}
      hint={SNIPPET_HINT}
      source={snippetOf(spec, events, locale, hourHeight)}
    />
  )
