import type { EventInput, LocaleId, RangeSpec } from '@midstem/chronous'
import type { ReactElement } from 'react'

import { Code } from '../code'
import type { EventData } from '../types'

import { FILE_NAME, SIMPLE_HINT, badgeOf } from './constants'
import { simpleOf } from './helpers'

type SimpleProps = {
  spec: RangeSpec
  events: readonly EventInput<EventData>[]
  locale: LocaleId
  hourHeight: number
}

export const Simple = ({
  spec,
  events,
  locale,
  hourHeight
}: SimpleProps): ReactElement => (
  <Code
    fileName={FILE_NAME}
    badge={badgeOf(spec.view, events.length)}
    hint={SIMPLE_HINT}
    source={simpleOf(spec, events, locale, hourHeight)}
  />
)
