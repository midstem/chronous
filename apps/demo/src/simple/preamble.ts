import type {
  CalendarRange,
  EventInput,
  LocaleId
} from '@midstem/chronous-react'

import { JSON_INDENT } from '../constants'
import type { EventData } from '../types'

import { KEY_PATTERN, KEY_REPLACEMENT, RANGE_INDENT } from './constants'

const literal = (value: unknown): string =>
  typeof value === 'number' ? String(value) : `'${String(value)}'`

const rangeLines = (range: CalendarRange): string =>
  Object.entries(range)
    .map(([key, value]) => `${RANGE_INDENT}${key}: ${literal(value)}`)
    .join(',\n')

const eventLines = (events: readonly EventInput<EventData>[]): string =>
  JSON.stringify(events, null, JSON_INDENT).replace(
    KEY_PATTERN,
    KEY_REPLACEMENT
  )

export const preambleOf = (
  range: CalendarRange,
  events: readonly EventInput<EventData>[],
  locale: LocaleId
): readonly string[] => [
  "import { createCalendarComponents } from '@midstem/chronous-react'",
  "import type { CalendarRange, EventInput } from '@midstem/chronous-react'",
  '',
  'type EventData = { title: string }',
  '',
  'const Calendar = createCalendarComponents<EventData>()',
  '',
  `const LOCALE = '${locale}'`,
  '',
  'const RANGE: CalendarRange = {',
  rangeLines(range),
  '}',
  '',
  `const EVENTS: EventInput<EventData>[] = ${eventLines(events)}`,
  ''
]
