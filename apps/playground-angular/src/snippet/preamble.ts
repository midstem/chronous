import type {
  CalendarRange,
  EventInput,
  LocaleId
} from '@midstem/chronous-angular'
import { JSON_INDENT } from '@midstem/playground-core'
import type { EventData } from '@midstem/playground-core'

import { KEY_PATTERN, KEY_REPLACEMENT, RANGE_INDENT } from './constants'

export type Needs = {
  clock: boolean
}

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

const importsOf = (needs: Needs): readonly string[] => [
  "import { Component, signal } from '@angular/core'",
  needs.clock
    ? "import { CALENDAR_DIRECTIVES, formatIso } from '@midstem/chronous-angular'"
    : "import { CALENDAR_DIRECTIVES } from '@midstem/chronous-angular'",
  needs.clock
    ? "import type { CalendarRange, EventInput, IsoDateTime, ViewKind } from '@midstem/chronous-angular'"
    : "import type { CalendarRange, EventInput, ViewKind } from '@midstem/chronous-angular'"
]

const clockLines = (locale: LocaleId): readonly string[] => [
  `const clock = (iso: IsoDateTime): string =>`,
  `  formatIso(iso, { locale: '${locale}', options: { hour: '2-digit', minute: '2-digit' } })`,
  ''
]

export const preambleOf = (
  range: CalendarRange,
  events: readonly EventInput<EventData>[],
  locale: LocaleId,
  needs: Needs
): readonly string[] => [
  ...importsOf(needs),
  '',
  'type EventData = { title: string }',
  '',
  `const LOCALE: string = '${locale}'`,
  '',
  'const INITIAL_RANGE: CalendarRange = {',
  rangeLines(range),
  '}',
  '',
  `const EVENTS: EventInput<EventData>[] = ${eventLines(events)}`,
  '',
  ...(needs.clock ? clockLines(locale) : [])
]
