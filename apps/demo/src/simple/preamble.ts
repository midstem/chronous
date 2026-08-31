import type { EventInput, LocaleId, RangeSpec } from '@midstem/chronous'

import { JSON_INDENT } from '../constants'
import type { EventData } from '../types'

import { KEY_PATTERN, KEY_REPLACEMENT, SPEC_INDENT } from './constants'

const literal = (value: unknown): string =>
  typeof value === 'number' ? String(value) : `'${String(value)}'`

const specLines = (spec: RangeSpec): string =>
  Object.entries(spec)
    .map(([key, value]) => `${SPEC_INDENT}${key}: ${literal(value)}`)
    .join(',\n')

const eventLines = (events: readonly EventInput<EventData>[]): string =>
  JSON.stringify(events, null, JSON_INDENT).replace(
    KEY_PATTERN,
    KEY_REPLACEMENT
  )

export const preambleOf = (
  spec: RangeSpec,
  events: readonly EventInput<EventData>[],
  locale: LocaleId
): readonly string[] => [
  "import type { EventInput, RangeSpec } from '@midstem/chronous'",
  "import { createCalendar } from '@midstem/chronous-react'",
  '',
  'type EventData = { title: string }',
  '',
  'const Calendar = createCalendar<EventData>()',
  '',
  `const LOCALE = '${locale}'`,
  '',
  'const SPEC: RangeSpec = {',
  specLines(spec),
  '}',
  '',
  `const EVENTS: EventInput<EventData>[] = ${eventLines(events)}`,
  ''
]
